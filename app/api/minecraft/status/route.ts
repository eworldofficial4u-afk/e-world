import { NextResponse } from "next/server";
import net from "net";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface MinecraftPingResult {
  online: boolean;
  ip: string;
  port: number;
  displayIp: string;
  version: string;
  motd: string;
  players: {
    online: number;
    max: number;
    list: Array<{ name: string; id: string }>;
  };
  ping: number;
  edition: string;
  checkedAt: number;
}

// In-memory cache to prevent socket flooding
let cachedResult: MinecraftPingResult | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds

function writeVarInt(value: number): Buffer {
  const bytes: number[] = [];
  while (true) {
    if ((value & ~0x7f) === 0) {
      bytes.push(value);
      break;
    }
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  return Buffer.from(bytes);
}

function readVarInt(buffer: Buffer, offset = 0): { value: number; size: number } {
  let value = 0;
  let size = 0;
  while (offset + size < buffer.length) {
    const b = buffer.readUInt8(offset + size);
    value |= (b & 0x7f) << (size * 7);
    size++;
    if ((b & 0x80) === 0) break;
  }
  return { value, size };
}

// Native Minecraft Server List Ping (SLP) over TCP
function pingMinecraftServer(host: string, port: number, timeout = 4000): Promise<MinecraftPingResult> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const socket = net.createConnection({ host, port, timeout }, () => {
      try {
        const hostBuf = Buffer.from(host, "utf8");
        // Handshake packet (ID: 0x00, protocol: 767, host, port, nextState: 1)
        const handshakeData = Buffer.concat([
          Buffer.from([0x00]),
          writeVarInt(767),
          writeVarInt(hostBuf.length),
          hostBuf,
          Buffer.from([(port >> 8) & 0xff, port & 0xff]),
          writeVarInt(1), // State: Status
        ]);
        const handshakePacket = Buffer.concat([
          writeVarInt(handshakeData.length),
          handshakeData,
        ]);

        // Status request packet (Length: 1, ID: 0x00)
        const statusPacket = Buffer.concat([writeVarInt(1), Buffer.from([0x00])]);

        socket.write(handshakePacket);
        socket.write(statusPacket);
      } catch (err) {
        socket.destroy();
        reject(err);
      }
    });

    let buffer = Buffer.alloc(0);

    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      try {
        if (buffer.length < 2) return;
        const { value: packetLen, size: lenSize } = readVarInt(buffer, 0);
        if (buffer.length >= packetLen + lenSize) {
          const { size: idSize } = readVarInt(buffer, lenSize);
          const { value: strLen, size: strLenSize } = readVarInt(buffer, lenSize + idSize);
          const strStart = lenSize + idSize + strLenSize;

          if (buffer.length >= strStart + strLen) {
            const rawJson = buffer.subarray(strStart, strStart + strLen).toString("utf8");
            socket.end();

            const parsed = JSON.parse(rawJson);
            const latency = Date.now() - startTime;

            let motdClean = "E-World SMP";
            if (typeof parsed.description === "string") {
              motdClean = parsed.description.replace(/§[0-9a-fk-or]/gi, "");
            } else if (parsed.description?.text) {
              motdClean = parsed.description.text;
            } else if (Array.isArray(parsed.description?.extra)) {
              motdClean = parsed.description.extra.map((e: any) => e.text || "").join("");
            }

            resolve({
              online: true,
              ip: host,
              port,
              displayIp: `${host}:${port}`,
              version: parsed.version?.name || "Purpur 1.21.11",
              motd: motdClean,
              players: {
                online: Number(parsed.players?.online || 0),
                max: Number(parsed.players?.max || 100),
                list: Array.isArray(parsed.players?.sample) ? parsed.players.sample : [],
              },
              ping: latency,
              edition: "Purpur / Crossplay (Java, Bedrock, TLauncher, SKLauncher)",
              checkedAt: Date.now(),
            });
          }
        }
      } catch {
        // Wait for more data chunks
      }
    });

    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("TCP connection timed out"));
    });

    socket.on("error", (err) => {
      socket.destroy();
      reject(err);
    });
  });
}

// Fallback to HTTP query APIs if TCP is restricted
async function fallbackHttpPing(host: string, port: number): Promise<MinecraftPingResult> {
  const url = `https://api.mcstatus.io/v2/status/java/${host}:${port}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error(`HTTP API status ${res.status}`);
  const data = await res.json();

  return {
    online: Boolean(data.online),
    ip: host,
    port,
    displayIp: `${host}:${port}`,
    version: data.version?.name_clean || "Purpur 1.21.11",
    motd: data.motd?.clean || "E-World SMP",
    players: {
      online: Number(data.players?.online || 0),
      max: Number(data.players?.max || 100),
      list: Array.isArray(data.players?.list) ? data.players.list : [],
    },
    ping: Number(data.round_trip_latency || 45),
    edition: "Purpur / Crossplay (Java, Bedrock, TLauncher, SKLauncher)",
    checkedAt: Date.now(),
  };
}

export async function GET() {
  const host = process.env.MC_SERVER_HOST || "151.243.226.61";
  const port = Number(process.env.MC_SERVER_PORT || 25565);

  const now = Date.now();
  if (cachedResult && now - lastFetchTime < CACHE_TTL_MS) {
    return NextResponse.json(cachedResult, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" },
    });
  }

  try {
    const result = await pingMinecraftServer(host, port).catch(async (tcpErr) => {
      console.warn("Direct TCP Minecraft ping failed, trying HTTP fallback:", tcpErr.message);
      return await fallbackHttpPing(host, port);
    });

    cachedResult = result;
    lastFetchTime = now;

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" },
    });
  } catch (err: any) {
    console.error("All Minecraft ping attempts failed:", err.message);

    // If completely offline or unreachable
    const offlineResult: MinecraftPingResult = {
      online: false,
      ip: host,
      port,
      displayIp: `${host}:${port}`,
      version: "Purpur 1.21.11",
      motd: "E-World SMP",
      players: {
        online: 0,
        max: 100,
        list: [],
      },
      ping: 0,
      edition: "Purpur / Crossplay",
      checkedAt: now,
    };

    return NextResponse.json(offlineResult, {
      status: 200,
      headers: { "Cache-Control": "no-cache" },
    });
  }
}
