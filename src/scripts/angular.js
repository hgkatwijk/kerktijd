
angular.
module('hgkatwijk-kerktijd', ['ngRoute', 'ngTouch']).

config(['$sceDelegateProvider', function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://diensten.hgkatwijk.nl/*'
  ]);
}]).

config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  //$locationProvider.html5Mode(true);

  $routeProvider.
  when('/week/:weekNr', {
    templateUrl: 'views/week.html',
    controller: 'WeekCtrl'
  }).
  when('/item/:itemId', {
    templateUrl: 'views/item.html',
    controller: 'ItemCtrl'
  }).
  otherwise({
    redirectTo: '/week/current'
  });
}]).

factory('currentWeek', function() {
  // Create a copy of this date object
  var target  = new Date();

  // ISO week date weeks start on monday
  // so correct the day number
  var dayNr   = (target.getDay() + 6) % 7;

  // ISO 8601 states that week 1 is the week
  // with the first thursday of that year.
  // Set the target date to the thursday in the target week
  target.setDate(target.getDate() - dayNr + 3);

  // Store the millisecond value of the target date
  var firstThursday = target.valueOf();

  // Set the target to the first thursday of the year
  // First set the target to january first
  target.setMonth(0, 1);
  // Not a thursday? Correct the date to the next thursday
  if (target.getDay() != 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }

  // The weeknumber is the number of weeks between the
  // first thursday of the year and the thursday in the target week
  return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
}).

filter('toArray', function () {
  return function (obj) {
    if (!(obj instanceof Object)) {
      return obj;
    }

    return Object.keys(obj).map(function (key) {
      return Object.defineProperty(obj[key], '$key', {__proto__: null, value: key});
    });
  };
}).


controller('AppCtrl', ['$scope', '$routeParams', '$http', '$location', function ($scope, $routeParams, $http, $location) {

  $scope.gotoWeek = function(week) {
    console.debug('Goto week ' + week);
    $location.path('/week/' + week);
  };
  $scope.gotoItem = function(item) {
    console.debug('Goto item ' + item);
    $location.path('/item/' + item);
  };
}]).

controller('WeekCtrl', ['$scope', '$routeParams', '$http', '$location', 'currentWeek', function ($scope, $routeParams, $http, $location, currentWeek) {
  var weekNr = $routeParams.weekNr || parseInt(currentWeek, 10);
  if (weekNr == 'current') {
    weekNr = currentWeek;
  }
  else if (weekNr == 'prev') {
    weekNr = currentWeek - 1;
  }
  else if (weekNr == 'next') {
    weekNr = currentWeek + 1;
  }
  weekNr = parseInt(weekNr, 10);

  document.title = "Week " + weekNr + " - <%= app.name %>";

  $scope.curr = weekNr;
  $scope.prev = $scope.curr - 1;
  $scope.next = $scope.curr + 1;


  $http({
    method: 'GET', //'JSONP',
    url: 'https://kerkapp.hgkatwijk.nl/api/v1/week.php',
    cache: true,
    params: {
      //callback: 'JSON_CALLBACK',
      week: weekNr
    }
  }).
  //jsonp('https://kerkapp.hgkatwijk.nl/api/v1/week.php?week=' + weekNr + '&callback=JSON_CALLBACK').
  success(function(data) {
    var sermons = data;


    $scope.sermonsByDay = {};
    var sermon;
    var months = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];
    var days = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
    var dayparts = ["Ochtend", "Middag", "Avond"];

    for (var i=0; i < sermons.length; i++) {
    //for (var i in sermons) {
      sermon = sermons[i];
      var d = new Date(sermon.date);
      var dp = parseInt(sermon.time.substr(0, 2), 10);
      if (dp < 12) {
        dp = dayparts[0];
      }
      else if (dp < 18) {
        dp = dayparts[1];
      }
      else {
        dp = dayparts[2];
      }

      $scope.sermonsByDay[sermon.date] = $scope.sermonsByDay[sermon.date] || {
        date: days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()],
        location: {}
      };
      $scope.sermonsByDay[sermon.date].location[sermon.church] = $scope.sermonsByDay[sermon.date].location[sermon.church] || {
        daypart: dp,
        weight: sermon.weight,
        sermons: {}
      };

      $scope.sermonsByDay[sermon.date].location[sermon.church].sermons[sermon.nid] = sermon;
    }

  });

}]).

controller('ItemCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
  $scope.itemId = $routeParams.itemId;

  $http.
  jsonp('https://kerkapp.hgkatwijk.nl/api/v1/item.php?item=' + $scope.itemId + '&callback=JSON_CALLBACK').
  success(function(data) {
    var sermons = data;

    $scope.sermon = sermons[$routeParams.itemId];

  });
}]);

/*angular.element(document).ready(function() {
  angular.bootstrap(document.documentElement, ['hgkatwijk-kerktijd']);
});*/

/*window.addEventListener(
    'scroll',
    function() {
        document.body.scrollTop = Math.round(document.body.scrollTop / 48) * 48;
    },
    false
);*/

