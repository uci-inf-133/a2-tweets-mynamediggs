function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	const options = {
		timeZone: "UTC",
		weekday: "long",
  		year: "numeric",
  		month: "long",
  		day: "numeric", 
	};

	document.getElementById('firstDate').innerText = tweet_array[tweet_array.length-1].time.toLocaleDateString
													 (undefined, options)
	document.getElementById('lastDate').innerText = tweet_array[0].time.toLocaleDateString
													 (undefined, options);

	tweet_type_counts = getTweetTypeCounts(tweet_array);

	document.getElementsByClassName('completedEvents')[0].innerText = tweet_type_counts[0];
	document.getElementsByClassName('completedEventsPct')[0].innerText = formatPct(tweet_type_counts[0]/tweet_array.length);
	document.getElementsByClassName('liveEvents')[0].innerText = tweet_type_counts[1];
	document.getElementsByClassName('liveEventsPct')[0].innerText = formatPct(tweet_type_counts[1]/tweet_array.length);
	document.getElementsByClassName('achievements')[0].innerText = tweet_type_counts[2];
	document.getElementsByClassName('achievementsPct')[0].innerText = formatPct(tweet_type_counts[2]/tweet_array.length);
	document.getElementsByClassName('miscellaneous')[0].innerText = tweet_type_counts[3];
	document.getElementsByClassName('miscellaneousPct')[0].innerText = formatPct(tweet_type_counts[3]/tweet_array.length);
	document.getElementsByClassName('completedEvents')[1].innerText = tweet_type_counts[0];
	document.getElementsByClassName('written')[0].innerText = tweet_type_counts[4];
	document.getElementsByClassName('writtenPct')[0].innerText = formatPct(tweet_type_counts[4]/tweet_array.length);
}

function formatPct(value)
{
	var perc = value * 100;
	return math.format(perc, {notation : 'fixed', precision : 2}) + '%';
}

function getTweetTypeCounts(tweet_array)
{
	// returns an array of four integers that represents the count 
	// of each event occurring in the tweet database.

	const tweet_type_counts = Array(5).fill(0);
	for(var tweet of tweet_array)
	{
		var tweet_type = tweet.source;
		console.log(tweet_type);
		if(tweet_type == "completed_event")
		{
			if(tweet.written)
			{
				tweet_type_counts[4]++;
			}
			tweet_type_counts[0]++;
		}
		else if(tweet_type == "live_event")
		{
			tweet_type_counts[1]++;
		}
		else if(tweet_type == "achievement")
		{
			tweet_type_counts[2]++;
		}
		else
		{
			tweet_type_counts[3]++;
		}
	}
	return tweet_type_counts;
}



//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});