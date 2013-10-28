
angular.
module('hgkatwijk-kerktijd', ['ngRoute', 'ngTouch']).

config(['$sceDelegateProvider', function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://diensten.hgkatwijk.nl/**'
  ]);
}]).

config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  //$locationProvider.html5Mode(true);

  $routeProvider.
  when('/week', {
    templateUrl: 'views/week.html',
    controller: 'WeeksCtrl',
    reloadOnSearch: false
  }).
  when('/item/:itemId', {
    templateUrl: 'views/item.html',
    controller: 'ItemCtrl'
  }).
  otherwise({
    redirectTo: '/week'
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


controller('AppCtrl', ['$scope', '$routeParams', '$http', '$location', 'currentWeek', function ($scope, $routeParams, $http, $location, currentWeek) {
  var historyDepth = 0;

  console.debug('historyDepth', historyDepth);

  $scope.gotoWeek = function(week) {
    if (week && week != currentWeek) {
      console.debug('Goto week ' + week + ' from "' + $location.url() + '"');

      if (!$location.search().week) {
        $location.search('week', week);
        historyDepth++;
        console.debug('historyDepth', historyDepth);
      }
      else {
        $location.search('week', week).replace();
      }
    }
    else if (historyDepth) {
      window.history.go(-historyDepth);
      historyDepth = 0;
      console.debug('historyDepth', historyDepth);
    }
    else {
      $location.url('/week');
    }
  };
  $scope.gotoItem = function(item) {
    console.debug('Goto item ' + item);

    $location.path('/item/' + item);
    historyDepth++;
    console.debug('historyDepth', historyDepth);
  };
}]).


controller('WeeksCtrl', ['$scope', '$routeParams', 'currentWeek', '$route', '$rootScope', function ($scope, $routeParams, currentWeek, $route, $rootScope) {
  var weekNr = parseInt($routeParams.week || currentWeek, 10);

  document.title = "<%= app.name %>";

  $scope.curr = weekNr;
  $scope.prev = $scope.curr - 1;
  $scope.next = $scope.curr + 1;

  $scope.weeks = {};
  $scope.weeks[$scope.prev] = { week: $scope.prev };
  $scope.weeks[$scope.curr] = { week: $scope.curr, isActive: true };
  $scope.weeks[$scope.next] = { week: $scope.next };

  $rootScope.$on('$routeUpdate', function(event, current) {
    var weekNr = parseInt(current.params.week || currentWeek, 10);

    if (weekNr == currentWeek) {
      document.title = "<%= app.name %>";
    }
    else {
      document.title = "Week " + weekNr + " - <%= app.name %>";
    }

    delete $scope.weeks[$scope.curr].isActive;

    $scope.curr = weekNr;
    $scope.prev = $scope.curr - 1;
    $scope.next = $scope.curr + 1;

    $scope.weeks[$scope.curr].isActive = true;

    if (!$scope.weeks[$scope.prev]) {
      $scope.weeks[$scope.prev] = { week: $scope.prev };
    }
    if (!$scope.weeks[$scope.next]) {
      $scope.weeks[$scope.next] = { week: $scope.next };
    }
  });

}]).

controller('WeekCtrl', ['$scope', '$http', function ($scope, $http) {
  var weekNr = $scope.week.week;

  var protocol = window.location.protocol == 'file:' ? 'http:' : '';
  $http({
    method: 'GET',
    //method: 'JSONP',
    url: protocol + '//kerkapp.hgkatwijk.nl/api/v1/week.php',
    cache: true,
    params: {
      //callback: 'JSON_CALLBACK',
      week: weekNr
    }
  }).
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


  var protocol = window.location.protocol == 'file:' ? 'http:' : '';
  $http({
    method: 'GET',
    //method: 'JSONP',
    url: protocol + '//kerkapp.hgkatwijk.nl/api/v1/item.php',
    cache: true,
    params: {
      //callback: 'JSON_CALLBACK',
      item: $scope.itemId
    }
  }).
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

/* Webkit bug: https://code.google.com/p/chromium/issues/detail?id=116655 */
window.addEventListener('scroll', function() {
  if (document.body.scrollLeft) document.body.scrollLeft = 0;
}, false);

