import data from '../ingestion/reutersBiz_2007to2010.json' with { type: 'json' };

const instructions = data.data.search_by_raw_query.search_timeline.timeline.instructions;

// Look at the first instruction
console.log('instruction keys:', Object.keys(instructions[0]));

// Look at first entry
const firstEntry = instructions[0].entries?.[0];
const tweetResults = firstEntry.content.itemContent.tweet_results;

console.log('core keys:', Object.keys(tweetResults.result.core));
console.log('user_results keys:', Object.keys(tweetResults.result.core.user_results));
console.log('user result keys:', Object.keys(tweetResults.result.core.user_results.result));
console.log('user legacy keys:', Object.keys(tweetResults.result.core.user_results.result.legacy));
