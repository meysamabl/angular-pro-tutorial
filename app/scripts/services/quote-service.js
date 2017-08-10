'use strict';

/**
 * @ngdoc service
 * @name stockDogApp.QuoteService
 * @description
 * # QuoteService
 * Service in the stockDogApp.
 */
 angular.module('stockDogApp')
 .service('QuoteService', function ($http, $interval, $sce) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var stocks = [];
    https://query.yahooapis.com/v1/public/yql
    var BASE = '//query.yahooapis.com/v1/public/yql';
    // [1] Handles updating stock model with appropriate data from quote
    var update = function (quotes) {
      console.log(quotes);
      if (quotes.length === stocks.length) {
        _.each(quotes, function (quote, idx) {
          var stock = stocks[idx];
          stock.lastPrice = parseFloat(quote.LastTradePriceOnly) ;
          stock.change = quote.Change;
          stock.percentChange = quote.ChangeinPercent;
          stock.marketValue = stock.shares * stock.lastPrice;
          stock.dayChange = stock.shares * parseFloat(stock.change);
          stock.save();
        });
      }
    };
    // [2] Helper functions for managing which stocks to pull quotes for
    this.register = function (stock) {
      stocks.push(stock);
    };
    this.deregister = function (stock) {
      _.remove(stocks, stock);
    };
    this.clear = function () {
      stocks = [];
    };
    // [3] Main processing function for communicating with Yahoo Finance API
    this.fetch = function () {
      var symbols = _.reduce(stocks, function (symbols, stock) {
        symbols.push(stock.company.symbol);
        return symbols;
      }, []);
      var query = encodeURIComponent('select * from yahoo.finance.quotes ' +
        'where symbol in (\'' + symbols.join(',') + '\')');
      var url = BASE + '?' + 'q=' + query + '&format=json&diagnostics=true' +
      '&env=http://datatables.org/alltables.env';
      var trustedUrl = $sce.trustAsResourceUrl(url);
      $http.jsonp(trustedUrl, {jsonpCallbackParam: 'callback'})
      .then(function (data) {
        if (data.query.count) {
          var quotes = data.query.count > 1 ?
          data.query.results.quote : [data.query.results.quote];
          update(quotes);
        }
      }, function (data) {
        console.log(data);
      }).catch(function(err) {
        _.each(stocks, function(stock) {
          stock.lastPrice = parseFloat(_.random(0, 200.5)) ;
          stock.change = 10 + _.random(-0.5, 0.5);
          stock.percentChange = 100 + _.random(-10.5, 10.5);
          stock.marketValue = stock.shares * stock.lastPrice;
          stock.dayChange = stock.shares * parseFloat(stock.change);
          stock.save();
        });
        console.log("sam");
      });
    };
    // [4] Used to fetch new quote data every 5 seconds
    $interval(this.fetch, 5000);

  });
