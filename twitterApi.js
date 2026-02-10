const btn = document.getElementById('findTweets');
const input = document.getElementById('tweet');
const output = document.querySelector('.showTweets');

btn.addEventListener('click', fetchTwitterData);

async function fetchTwitterData() {
    const username = input.value.trim();
    if (!username) {
        output.textContent = 'Please enter a username.';
        return;
    }
    try{
      const response=await fetch(`http://localhost:3000/api/last-tweets?username=${encodeURIComponent(username)}`)
      if (!response.ok) {
        output.textContent = `Error fetching tweets: ${response.status}`;
        return;
      }
      const data =await response.json();
      console.log(data);
      output.innerHTML = '';
      let tweetlist=data.data.tweets;
      for(const tweet of tweetlist){
          const tweetElement = document.createElement('div');
          tweetElement.innerHTML =`text: ${tweet.text || "None"} \n | created at: ${tweet.createdAt}\n retweeted_tweet: ${tweet.retweeted_tweet?.text || "None"}\n`;
          tweetElement.style.marginBottom = "10px";
          if(tweet.retweeted_tweet?.url != null)tweetElement.innerHTML+=`Retwitted post link: <a href="${tweet.retweeted_tweet.url || '#'}"> ${tweet.retweeted_tweet.url}  </a>`
          output.appendChild(tweetElement);
      }
     
  }catch(err){
    console.error('Error:', err);
    output.textContent = `Error: ${err.message}`;
  }
}
