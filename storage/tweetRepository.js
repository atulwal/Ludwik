import { supabase } from './supabaseClient.js';
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Inserts raw tweets into the database, ignoring duplicates.
 */
export async function insertRawTweets(tweets) {
    if (!tweets || tweets.length === 0) return { error: null, count: 0 };

    // Map array of tweet objects to schema
    const formattedTweets = tweets.map(t => ({
        tweet_id: t.id,
        handle: t.author?.userName || 'unknown',
        text: t.text,
        created_at_source: t.createdAt,
        raw_json: t
    }));

    const { data, error } = await supabase
        .from('tweets_raw')
        .upsert(formattedTweets, { onConflict: 'tweet_id', ignoreDuplicates: true });

    if (error) {
        console.error("Error inserting tweets:", error);
    }

    return { data, error, count: formattedTweets.length };
}

/**
 * Gets a list of handles that are marked active.
 */
export async function getActiveHandles() {
    const { data, error } = await supabase
        .from('handles')
        .select('handle')
        .eq('active', true)
        .order('priority', { ascending: false });

    if (error) {
        console.error("Error fetching handles:", error);
        return [];
    }

    return data.map(row => row.handle);
}

/**
 * Updates the last_fetched_at timestamp for a handle.
 */
export async function updateHandleFetchTime(handle) {
    const { error } = await supabase
        .from('handles')
        .update({ last_fetched_at: new Date().toISOString() })
        .eq('handle', handle);

    if (error) {
        console.error(`Error updating fetch time for ${handle}:`, error);
    }
}

/**
 * Gets the latest tweets for the UI.
 */
export async function getLatestTweets(limit = 20) {
    const { data, error } = await supabase
        .from('tweets_raw')
        .select('*')
        .order('created_at_source', { ascending: false })
        .limit(limit);

    if (error) {
        throw error;
    }
    return data;
}

/**
 * Gets a batch of unprocessed tweets from the database.
 */
export async function getUnprocessedTweets(limit = 100) {
    const { data, error } = await supabase
        .from('tweets_raw')
        .select('*')
        .eq('processing_status', 'pending')
        .order('created_at_source', { ascending: true })
        .limit(limit);

    if (error) {
        console.error("Error fetching unprocessed tweets:", error);
        return [];
    }
    return data;
}

/**
 * Saves processed sentiment data into tweet_sentiment table.
 */
export async function saveTweetSentiment(sentimentRows) {
    if (!sentimentRows || sentimentRows.length === 0) return { error: null };

    const { error } = await supabase
        .from('tweet_sentiment')
        .upsert(sentimentRows, { onConflict: 'tweet_id' });

    if (error) {
        console.error("Error saving sentiment rows:", error);
    }
    return { error };
}

/**
 * Updates the processing_status of raw tweets after successful sentiment analysis.
 */
export async function markTweetsAsProcessed(tweetIds) {
    if (!tweetIds || tweetIds.length === 0) return { error: null };

    // Using an IN query to update multiple rows in one operation
    const { error } = await supabase
        .from('tweets_raw')
        .update({ processing_status: 'processed' })
        .in('tweet_id', tweetIds);

    if (error) {
        console.error("Error marking tweets as processed:", error);
    }
    return { error };
}

// export async function getSentimentSummary(days = 7) {
//     // What is this function doing? I already have made a sentiment analyzer in /trainingData folder. 
//     // Use that to get table fields and sentiments.
// }


//Batch updating function for raw tweets database for training data


export async function HistoricRawTweetUpdating() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const ingestionDir = path.join(__dirname, '../ingestion');

    // Get all files matching the pattern
    const allFiles = await readdir(ingestionDir);
    const matchingFiles = allFiles.filter(f => f.startsWith('reutersBiz_') && f.endsWith('.json'));

    console.log(`Found ${matchingFiles.length} files:`, matchingFiles);

    for (const file of matchingFiles) {
        console.log(`Processing ${file}...`);
        const raw = await readFile(path.join(ingestionDir, file), 'utf-8');
        const data = JSON.parse(raw);
        const instructions = data.data?.search_by_raw_query?.search_timeline?.timeline?.instructions[0]?.entries;

if (!instructions) {
    console.warn(`Skipping ${file} — unexpected structure`);
    continue;
}
// $.data.search_by_raw_query.search_timeline.timeline.instructions.0.entries.0.content.itemContent.tweet_results.result.legacy.created_at
       
            for (const tweet of instructions) {
                    if (!tweet.content?.itemContent?.tweet_results) continue;

    const result = tweet.content.itemContent.tweet_results.result;

    const formattedTweet = {
        created_at_source: result.legacy.created_at,
        text:              result.legacy.full_text,
        tweet_id:          result.legacy.conversation_id_str,
        handle:            result.core.user_results.result.core.screen_name
    };

              

                const { error } = await supabase
                    .from('tweets_raw')
                    .upsert(formattedTweet, { onConflict: 'tweet_id', ignoreDuplicates: true });

                if (error) console.error(`Error inserting tweet from ${file}:`, error);
            }
        

        console.log(`Done processing ${file}`);
    }
}
HistoricRawTweetUpdating();