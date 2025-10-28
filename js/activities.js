function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	const activity_map = mapTweetArray(tweet_array);
	const sorted_activity_map = new Map([...activity_map.entries()].sort((a, b) => b[1] - a[1]));
	document.getElementById('numberActivities').innerText = sorted_activity_map.size;

	const keyIterator = sorted_activity_map.keys();

	//big_three holds the top 3 activities
	var big_three = Array(3).fill("");

	const key1 = keyIterator.next().value;
	document.getElementById('firstMost').innerText = key1;
	big_three[0] = key1;

	const key2 = keyIterator.next().value;
	document.getElementById('secondMost').innerText = key2;
	big_three[1] = key2;

	const key3 = keyIterator.next().value;
	document.getElementById('thirdMost').innerText = key3;
	big_three[2] = key3;

	const popular_activities = mapPopularActivityArray(tweet_array, big_three);
	const common_activities = findActivitySummary(popular_activities);

	document.getElementById('longestActivityType').innerText = common_activities[0];
	document.getElementById('shortestActivityType').innerText = common_activities[1];
	document.getElementById('weekdayOrWeekendLonger').innerText = common_activities[2];

	document.getElementById('aggregate').addEventListener("click", onShowButtonClick);
	function onShowButtonClick()
	{	
		// hides the current graph and makes the other visible when
		// the button is clicked

		if(!document.getElementById('distanceVis').hidden)
		{
			document.getElementById('distanceVis').hidden = true;
			document.getElementById('distanceVisAggregated').hidden = false;
			document.getElementById('aggregate').innerText = "Show all activities"
		}
		else
		{
			document.getElementById('distanceVis').hidden = false;
			document.getElementById('distanceVisAggregated').hidden = true;
			document.getElementById('aggregate').innerText = "Show means"
		}
	}

	// converts map to array of objects so that vega-lite can process the information 
	var activity_count_data = Array.from(sorted_activity_map, ([activityType, count]) => ({activityType, count}));

	// creates an array of objects filtered by the big three activities
	var distance_graph = tweet_array.filter(tweet => big_three.includes(tweet.activityType)).map(tweet => ({
  		activityType: tweet.activityType,
  		day: tweet.time.toLocaleDateString("en-US", { weekday: "short" }),
  		distance: tweet.distance
	}));

	activity_count_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {"values": activity_count_data},
	  "mark" : "bar",
	  "encoding": {
			"y": {
			"field": "count",
			"type": "quantitative"
		},
			"x": {
			"field": "activityType",
			"type": "nominal",
		}
	  }
	};

	distance_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {"values": distance_graph},
	  "mark" : "point",
	  "encoding": {
			"y": {
			"field": "distance",
			"type": "quantitative"
		},
			"x": {
			"field": "day",
			"type": "ordinal",
			"sort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		},
			"color": {
			"field": "activityType",
			"type": "nominal"
		}
	  }
	};

	distance_vis_aggregate_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {"values": distance_graph},
	  "mark" : "point",
	  "encoding": {
			"y": {
			"aggregate": "mean",
			"field": "distance",
			"type": "quantitative"
		},
			"x": {
			"field": "day",
			"type": "ordinal",
			"sort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		},
			"color": {
			"field": "activityType",
			"type": "nominal"
		}
	  }
	};
	vegaEmbed('#activityVis', activity_count_vis_spec, {actions:false});
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});
	vegaEmbed('#distanceVisAggregated', distance_vis_aggregate_spec, {actions:false});
	document.getElementById('distanceVisAggregated').hidden = true;
}


function mapTweetArray(tweet_array)
{
	// returns a map of all of the unique activities and how many times
	// they show up in the saved tweets

	const common_activities = new Map();
	for (var tweet of tweet_array)
	{
		
		var activity = tweet.activityType;
		if(activity == "unknown" || activity == "")
		{
			continue;
		} 

		if(common_activities.has(activity))
		{
			common_activities.set(activity, common_activities.get(activity) + 1);	
		}
		else
		{
			common_activities.set(activity, 1);
		}
	}
	return common_activities;
}


function mapPopularActivityArray(tweet_array, big_three)
{
	// returns a map holding the big_three activities as three keys, 
	// with an array of 6 elements being the values of those keys.

	// in the array,
	// [0] holds the total number of tweets that performed an activity in the big three
	// [1] holds the total distance of the tweets counted in [0]
	// [2] holds the total number of tweets that performed an activity in the big three on the weekend.
	// [3] holds the total distance of the tweets counted in [2]
	// [4] holds the total number of tweets that performed an activity in the big three on the weekday.
	// [5] holds the total distance of the tweets counted in [4]

	const popular_activities = new Map();
	for (var tweet of tweet_array)
	{
		var activity = tweet.activityType;
		if(!big_three.includes(activity))
		{
			continue;
		}

		const distance = tweet.distance;
		if(popular_activities.has(activity))
		{
			if(tweet.time.toDateString().startsWith("S"))
			{
				popular_activities.set(activity, [popular_activities.get(activity)[0] + 1,
												  popular_activities.get(activity)[1] + distance,
												  popular_activities.get(activity)[2],
												  popular_activities.get(activity)[3], 
												  popular_activities.get(activity)[4] + 1,
												  popular_activities.get(activity)[5] + distance])
			}
			else
			{
				popular_activities.set(activity, [popular_activities.get(activity)[0] + 1,
												  popular_activities.get(activity)[1] + distance,
												  popular_activities.get(activity)[2] + 1,
												  popular_activities.get(activity)[3] + distance, 
												  popular_activities.get(activity)[4],
												  popular_activities.get(activity)[5]])
			}
		}
		else
		{
			if(tweet.time.toDateString().startsWith("S"))
			{
				popular_activities.set(activity, [1, distance, 0, 0, 1, distance])
			}
			else
			{
				popular_activities.set(activity, [1, distance, 1, distance, 0, 0])
			}
		}
		
	}
	return popular_activities;
}


function findActivitySummary(popular_activities)
{

	// Finds the answers to the '???' sections in activity.js
	// based on a parameter 'popular_activities', a map
	// generated by mapPopularActivityArray()

	for(var [key, value] of popular_activities)
	{
		//total distance avg 
		value[1] = value[1]/value[0];

		//weekday distance avg
		value[3] = value[3]/value[2];

		//weekend distance avg
		value[5] = value[5]/value[4];
	}

	var longestActivity = "";
	var shortestActivity = "";
	var longestDayType = "";

	var maximum = 0;
	var minimum = Infinity;
	
	for(var [key, value] of popular_activities)
	{
		if(value[1] >= maximum)
		{
			maximum = value[1];
			longestActivity = key;
		}

		if(value[1] <= minimum)
		{
			minimum = value[1];
			shortestActivity = key;
		}
	}
	console.log(maximum);
	
	var distance_values = popular_activities.values().next().value;
	if(distance_values[5] >= distance_values[3])
	{
		longestDayType = "weekends";
	}
	else
	{
		longestDayType = "weekdays";
	}
	
	console.log(longestActivity);
	return [longestActivity, shortestActivity, longestDayType];
	
}


//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});