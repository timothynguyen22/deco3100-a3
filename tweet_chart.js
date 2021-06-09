const config = {
  displayModeBar: false,
  responsive: true
}



function combine_and_filter(trump_tweets, obama_tweets, tsne_data_trump, tsne_data_obama) {
  //add tsne data to trump and obama tweets
  trump_tweets = trump_tweets.map((trump_tweet, index) => Object.assign(trump_tweet, tsne_data_trump[index]))
  obama_tweets = obama_tweets.map((obama_tweet, index) => Object.assign(obama_tweet, tsne_data_obama[index]))

  //add an author property
  for(let tweet of trump_tweets){
    tweet.author = "Trump"
  }
  for(let tweet of obama_tweets){
    tweet.author = "Obama"
  }
  
  //combine all tweets into one array
  let tweets = [...trump_tweets, ...obama_tweets];
  

  //only include tweets containing one of these strings
  //Try experimenting with different search tags
  let racism_tweets = tweets.filter(tweet => ["racism", "racist", "equality", "racial", "rights", "equal", "diversity", "discrimination", "stereotype", "black", "phobic"].some(topic => tweet.text.includes(topic)));

  let together_tweets = tweets.filter(tweet => ["together", "segregate", "united", "separate", "border"].some(topic => tweet.text.includes(topic)));

  //Try out some of these other filters!
  //tweets = tweets.filter(tweet => tweet.text.includes("thank"))
  //tweets = tweets.filter(tweet => tweet.sentiment > 0.5) //positive tweets
  //tweets = tweets.filter(tweet => tweet.sentiment < 0) //negative tweets
  //tweets = tweets.filter(tweet => new Date(tweet.datetime) < new Date(2014, 0, 0))
  //tweets = tweets.filter(tweet => new Date(tweet.datetime) > new Date(2015, 6, 3) && new Date(tweet.datetime) < new Date(2015, 6, 5))
  let negative_obama = tweets.filter(tweet => tweet.sentiment < 0 && new Date(tweet.datetime) > new Date(2014, 6, 5) && new Date(tweet.datetime) < new Date(2015, 6, 5));
  let negative_trump = tweets.filter(tweet => tweet.sentiment < 0 && new Date(tweet.datetime) > new Date(2016, 6, 5) && new Date(tweet.datetime) < new Date(2017, 6, 5));

  return {
    racism: racism_tweets,
    together: together_tweets,
    negative_o: negative_obama,
    negative_t: negative_trump
  };
}

function make_plot(tweets){
  let trace1 = {
    x: tweets['racism'].map(d => d.x),
    y: tweets['racism'].map(d => d.y),
    customdata: tweets['racism'].map(d => convertToParagraph(d.author + ": " + d.text, 64)),
    visible: true,
    marker: {
      color: tweets['racism'].map(d => d.author == "Trump" ? 0 : 1), //color 0 if trump, 1 if obama
      size: 8,
      colorscale: [ //custom color scheme
        ['0.0', 'rgb(233,20,30)'],
        ['1.0', 'rgb(0,175,243)'],
      ]
    },
    mode: 'markers',
    type: 'scatter',
    showlegend: false,
    hovertemplate:
      "%{customdata}" +
      "<extra></extra>", //hide extra tooltip info
  }
  let trace2 = {
    x: tweets['together'].map(d => d.x),
    y: tweets['together'].map(d => d.y),
    customdata: tweets['together'].map(d => convertToParagraph(d.author + ": " + d.text, 64)),
    visible: false,
    marker: {
      color: tweets['together'].map(d => d.author == "Trump" ? 0 : 1), //color 0 if trump, 1 if obama
      size: 8,
      colorscale: [ //custom color scheme
        ['0.0', 'rgb(233,20,30)'],
        ['1.0', 'rgb(0,175,243)'],
      ]
    },
    mode: 'markers',
    type: 'scatter',
    showlegend: false,
    hovertemplate:
      "%{customdata}" +
      "<extra></extra>", //hide extra tooltip info
  }
  
  let data = [trace1, trace2];

  let trace3 = {
    x: tweets['negative_o'].map(d => d.x),
    y: tweets['negative_o'].map(d => d.y),
    customdata: tweets['negative_o'].map(d => convertToParagraph(d.author + ": " + d.text, 64)),
    visible: true,
    marker: {
      color: 'rgb(0,175,243)',
      size: 8,
    },
    mode: 'markers',
    type: 'scatter',
    showlegend: false,
    hovertemplate:
      "%{customdata}" +
      "<extra></extra>", //hide extra tooltip info
  }

  let trace4 = {
    x: tweets['negative_t'].map(d => d.x),
    y: tweets['negative_t'].map(d => d.y),
    customdata: tweets['negative_t'].map(d => convertToParagraph(d.author + ": " + d.text, 64)),
    visible: false,
    marker: {
      color: 'rgb(233,20,30)',
      size: 8,
    },
    mode: 'markers',
    type: 'scatter',
    showlegend: false,
    hovertemplate:
      "%{customdata}" +
      "<extra></extra>", //hide extra tooltip info
  }

  let data2 = [trace3, trace4]

  let pieData = [{
      values: [6258, 16717],
      labels: ['Obama', 'Trump'],
      type: 'pie',
      textinfo: "label+percent",
      marker: {
        colors: [
          'rgb(0,175,243)',
          'rgb(233,20,30)'
        ]
      }
  }]

  var updatemenus = [
    {
        buttons: [
            {
                args: [{'visible': [true, false]},
                       {'title': 'Tweets relating to Equality and Rights'
                       }],
                label: 'Equality Tweets',
                method: 'update'
            },
            {
                args: [{'visible': [false, true]},
                       {'title': 'Tweets relating to Unity and Separation'
                       }],
                label: 'Unity Tweets',
                method: 'update'
            },
            {
                args: [{'visible': [true, true]},
                       {'title': 'Tweets relating to Equality, Rights, Unity and Separation',
                       }],
                label: 'Both',
                method: 'update'
            }
        ],
        direction: 'left',
        pad: {'r': 10, 't': 10},
        showactive: true,
        type: 'buttons',
        type: 'buttons',
        x: 0.1,
        xanchor: 'center',
        y: 0,
        yanchor: 'left'
    },
  ]

  var updatemenus2 = [
    {
        buttons: [
            {
                args: [{'visible': [true, false]},
                       {'title': 'Obama Negative Tweets from 5/6/2014 - 5/6/2015'
                       }],
                label: 'Obama',
                method: 'update'
            },
            {
                args: [{'visible': [false, true]},
                       {'title': 'Trump Negative Tweets 5/6/2016 - 5/6/2017'
                       }],
                label: 'Trump',
                method: 'update'
            },
            {
                args: [{'visible': [true, true]},
                       {'title': 'President Negative Tweets',
                       }],
                label: 'Both Presidents',
                method: 'update'
            }
        ],
        direction: 'left',
        pad: {'r': 10, 't': 10},
        showactive: true,
        type: 'buttons',
        type: 'buttons',
        x: 0.1,
        xanchor: 'center',
        y: 0,
        yanchor: 'left'
    },
  ]

  let layout = {
    title: {
      text:'President Tweets in regards to Equality and Rights',
      font: {
          color: "rgb(27,51,100)",
          family: 'Public Sans, sans-serif',
          size: 18
      }
    },
    hovermode: "closest", //hover closest by default
    updatemenus: updatemenus,
    xaxis: {
      visible: false,
    },
    yaxis: {
      visible: false,
    }
  }

  let layout2 = {
    title: {
      text:'Negative Presidential Tweets within a year',
      font: {
          color: "rgb(27,51,100)",
          family: 'Public Sans, sans-serif',
          size: 18
      }
    },
    hovermode: "closest", //hover closest by default
    updatemenus: updatemenus2,
    xaxis: {
      visible: false,
    },
    yaxis: {
      visible: false,
    }
  }

  let pieLayout = {
    title: {
      text: 'Amount of tweets by president',
      font: {
        color: "rgb(27,51,100)",
        family: 'Public Sans, sans-serif',
        size: 18
      }
    },
    legend: {
      showLegend: true,
      font: {
        color: "rgb(27,51,100)",
        family: 'Public Sans, sans-serif',
      }
    },
    font: {
      family: 'Public Sans, sans-serif',
      color: "white",
      size: 16
    }
  }

  Plotly.newPlot('plotDiv', data, layout, config);
  Plotly.newPlot('plot2Div', pieData, pieLayout, config);
  Plotly.newPlot('plot3Div', data2, layout2, config);
}

//from https://codereview.stackexchange.com/a/171857
function convertToParagraph(sentence, maxLineLength){
  let lineLength = 0;
  sentence = sentence.split(" ")
  return sentence.reduce((result, word) => {
    if (lineLength + word.length >= maxLineLength) {
      lineLength = word.length;
      return result + `<br>${word}`;
    } else {
      lineLength += word.length + (result ? 1 : 0);
      return result ? result + ` ${word}` : `${word}`;
    }
  }, '');
}

Plotly.d3.csv("data/trump_presidential_tweets.csv", (trump_tweets) => {
  Plotly.d3.csv("data/obama_presidential_tweets.csv", (obama_tweets) => {
    Plotly.d3.csv("data/tsne_and_cluster/tsne_data_trump.csv", (tsne_data_trump) => {
      Plotly.d3.csv("data/tsne_and_cluster/tsne_data_obama.csv", (tsne_data_obama) => {
        let tweets = combine_and_filter(trump_tweets, obama_tweets, tsne_data_trump, tsne_data_obama)
        make_plot(tweets);
        make_plot(tweets['pieData']);
        make_plot(tweets['data2']);
      });
    });
  });
});