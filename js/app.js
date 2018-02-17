const YTB_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const result = $('.result-ul');


//get API from youtube

//as you see, there is no pageToken in data
function getDataFromApi(searchTerm, pageToken, callback) {
  const setting = {
  	url: YTB_SEARCH_URL,
    data: {
    	//yes. no pageToken here. so we go NULL, go and see bottom
    	part: 'snippet',
    	key: 'AIzaSyAkcjnCcHDCNVjZXC28pvI8ur0GMxoAKTY',
    	type: 'video',
    	q: `${searchTerm}`,
    	maxResults: 8
    },
    dataType: 'json',
  	type: "GET",
    success: callback,
    error: renderError
  };

  //and if pageToken came (when the result goes further than maxResults), replace the token with inherited one
  if(pageToken) {
		setting.data.pageToken = pageToken;
	}
  $.ajax(setting);
}

//error
function renderError(error) {
  result.html(error+ 'Something went wrong!');
}

//make base of HTML strcuture, and put variables in 
const HTML_base = (
	`<li class="result-li">
		<a class="img-link" target:"_blank" href=""> 
			<img class="img" src="">
		</a>
		<p class="detail"></p>
		<p>
           Channel: 
           <a class="channel" target:"_blank" 
           	  href=""></a>
        </p>
	</li>
	`);

//design
function render(result) {
	//get frame from HTML_base. look up. 
	const structure = $(HTML_base);

	//fill some variables
	structure.find(".img").attr("src", result.snippet.thumbnails.default.url);
  	structure.find(".img-link").attr("href", 'https://www.youtube.com/watch?v=' + result.id.videoId);
  	structure.find(".channel").attr("href", 'https://www.youtube.com/channel/' + result.snippet.channelId)
  	structure.find(".detail").text(result.snippet.title);
  	structure.find(".channel").text(result.snippet.channelTitle);

	return structure;
}


// https://developers.google.com/youtube/v3/docs/search/list?hl=en

// if there are more result than my maxResults = 8 ( line17 ), the "nextPageToken" goes TRUE
function setPageTokens(nextPageToken, prevPageToken) {
	if(nextPageToken) {
		$('.next').removeClass('hidden');
		$('.next').on('click', event => {
			event.preventDefault();
			//now you see the reason why we saved the searched value for
			getDataFromApi($('.saveQuery').val(), nextPageToken, displayYouTubeData)		
	    });
	} 
	else {
		$('.next').addClass('hidden');
	}
// vice versa
	if(prevPageToken) {
		$('.prev').removeClass('hidden');
		$('.prev').on('click', event => {
			event.preventDefault();
			getDataFromApi($('.saveQuery').val(), prevPageToken, displayYouTubeData)			
	    });
	} 
	else {
		$('.prev').addClass('hidden');
	}
}

function displayYouTubeData (data) {

	//take action if there are other pages available
	let nextPageToken = data.nextPageToken;
	let prevPageToken = data.prevPageToken;

	//go setPageTokens and look how does the function works
	setPageTokens(nextPageToken, prevPageToken);

	//let user know how many results have searched
	const resNum = data.pageInfo.totalResults;

	//let's see how "render" function works. go render
	const results = data.items.map((item, index) => render(item));
    result.html(results);

    //how many results
    $('.howMany').text(resNum + 'Results Available');
}


//listen-to-user

//as we get no token from beginning
$('.getForm').submit(function(e){
	e.preventDefault();
	const queryTarget = $(e.currentTarget).find('.getDat');
	const query = queryTarget.val();
	
	//save what user searched here - hidden input. for next/prev action
	$('.saveQuery').val(query);

	//clean input
	queryTarget.val(" ");

	//I put null here.
  	getDataFromApi(query, null, displayYouTubeData);

  	//go displayYouTubeData
});
