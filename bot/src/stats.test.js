import test from 'node:test';
import assert from 'node:assert/strict';
import { collectStats } from './stats.js';
test('collects only aggregate presence and connected voice states', () => {
 const stats = collectStats({ id: 'guild', memberCount: 10, premiumSubscriptionCount: 2,
 presences: { cache: new Map(['online','idle','dnd','offline'].map((status,i) => [i,{status}])) },
 voiceStates: { cache: new Map([[1,{channelId:'a'}],[2,{channelId:'a'}],[3,{channelId:null}]]) },
 channels: { cache: { filter: () => ({size:3}) } }, roles:{cache:{size:4}} });
 assert.equal(stats.online,3); assert.equal(stats.idle,1); assert.equal(stats.dnd,1);
 assert.equal(stats.voiceConnected,2); assert.equal(stats.activeVoiceChannels,1);
 assert.equal(stats.totalMembers,10); assert.equal(stats.members,undefined);
});
