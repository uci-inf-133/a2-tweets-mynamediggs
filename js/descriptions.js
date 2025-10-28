function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	tweet_array = tweet_array.filter(function(n) {
		return (n.written && n.activityType != "unknown");
	})
	
}

function addEventHandlerForSearch() 
{
	var search = document.getElementById('textFilter');
	var table = document.getElementById('tweetTable');
	search.addEventListener('input', function()
	{
		
		table.innerHTML = "";
		var query = search.value;
		if(query == '')
		{
			document.getElementById('searchCount').innerText = 0;
			document.getElementById('searchText').innerText = '';
			return;
		}

		var filtered_tweets = tweet_array.filter(function(tweet)
		{
			return tweet.writtenText.includes(query);
		});

		document.getElementById('searchCount').innerText = filtered_tweets.length;
		document.getElementById('searchText').innerText = query;

		for(let i = 0; i < filtered_tweets.length; ++i)
		{
			table.innerHTML += filtered_tweets[i].getHTMLTableRow(i + 1);
		}
	})

	
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});