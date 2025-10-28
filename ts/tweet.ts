class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) 
    {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

    get source():string 
    {
        //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
        var description:string = this.text;
        
        if(description.startsWith("Just"))
        {
            return "completed_event";
        }
        else if(description.startsWith("Watch my run"))
        {   
            return "live_event";
        }
        else if(description.startsWith("Achieved"))
        {
            return "achievement";
        }
        else
        {
            return "miscellaneous";
        }
    }

    
    get written():boolean 
    {
        //returns a boolean, whether the text includes any content written by the person tweeting.
        if(this.text.includes("Check it out!"))
        {
            return false;
        }

        return true; 
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }

        var hyphen_index:number = this.text.indexOf(" - ");
        return this.text.substring(hyphen_index + 2);
    }

    get preLinkText():string{
        if(!this.written){
            return "";
        }

        var link_index:number = this.text.indexOf("https");
        return this.text.substring(0, link_index);
    }

    get linkText():string {
        if(!this.written){
            return "";
        }

        var link_index:number = this.text.indexOf("https");
        var shortened = this.text.substring(link_index);
        var hash_index:number = shortened.indexOf("#");
        return shortened.substring(0, hash_index-1);
    }   

    get postLinkText():string{
        if(!this.written){
            return "";
        }

        return " #Runkeeper"
    }

    get activityType():string {
        if (this.source != "completed_event") {
            return "unknown";
        }
        
        if(this.written)
        {
            var hyphen_index:number = this.text.indexOf(" - ");
            var shortened:string = this.text.substring(0, hyphen_index);
        }
        else
        {
            var with_index:number = this.text.indexOf(" with");
            var shortened:string = this.text.substring(0, with_index);
        }
        

        if (this.text.includes(" mi ") || this.text.includes(" km "))
        {
            //"Just posted a 5.15 km elliptical workout"
            var common_a_index:number = shortened.indexOf(" a ");
            var space_index:number = shortened.lastIndexOf(" ");

            shortened = shortened.substring(common_a_index + 3);
            //"5.15 km elliptical workout"
            space_index = shortened.indexOf(" ");
            shortened = shortened.substring(space_index + 1);
            //"km elliptical workout"
            space_index = shortened.indexOf(" ");
            shortened = shortened.substring(space_index + 1);
            
            //"elliptical workout"
            return shortened;

        }
        else
        {
            // "Just posted a strength workout in 2:10:00 "
            // "Just posted a yoga practice in 1:00:00 "
            var in_index:number = shortened.indexOf(" in ");
            var posted_index:number = shortened.indexOf("posted");
            
            shortened = shortened.substring(posted_index + 7, in_index)
            // "a strength workout"
            // "a yoga practice"

            space_index = shortened.indexOf(" ");
            shortened = shortened.substring(space_index + 1);
            // "strength workout"
            // "yoga practice"

            return shortened;
        }
    }

    get distance():number {
        if(this.source != "completed_event") {
            return 0;
        }
        
        // if text doesn't have distance units then i return 0 for the distance
        if (!(this.text.includes(" mi ") || this.text.includes(" km ")))
        {
            return 0;
        }

        if(this.written)
        {
            var hyphen_index:number = this.text.indexOf(" - ");
            var shortened:string = this.text.substring(0, hyphen_index);
        }
        else
        {
            var with_index:number = this.text.indexOf(" with");
            var shortened:string = this.text.substring(0, with_index);
        }
        
        var space_index:number = shortened.lastIndexOf(" ");  

        shortened = shortened.substring(0, space_index);
        //"Just posted a 10.34 km"
        space_index = shortened.lastIndexOf(" ");

        var distance_unit:string = shortened.substring(space_index + 1);
        //"km"

        shortened = shortened.substring(0, space_index);
        //"Just posted a 10.34"
        space_index = shortened.lastIndexOf(" ");

        var distance_str:string = shortened.substring(space_index + 1);
        //10.34"

        var distance_amt:number = parseFloat(distance_str);

        if(distance_unit == "km")
        {
            return distance_amt / 1.609;
        }

        return distance_amt;
    }



getHTMLTableRow(rowNumber: number): string {
  return '<tr>' +
      '<td>' + rowNumber + '</td>' +
      '<td>' + this.activityType + '</td>' +
      '<td>' + this.preLinkText + '<a href=' + this.linkText + '>' + this.linkText + '</a>' + this.postLinkText + '</td>'+
        '</tr>';
  
}
}