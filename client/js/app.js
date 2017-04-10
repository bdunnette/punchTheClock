function logMilestone(message) {
  console.log(" ================== " + message + " ================== ")
}

var app = angular.module('punchTheClock', [
  'ui.router',
  'ui.bootstrap',
  'ngCookies',
  'lbServices',
  'ls.LiveSet',
  'ls.ChangeStream'
]);

app.run(RunBlock);

RunBlock.$inject = ['$state', '$rootScope'];

function RunBlock($state, $rootScope) {
  // $state.go('home');
  $rootScope.$on('$stateChangeError', function $stateChangeError(event, toState,
    toParams, fromState, fromParams, error) {
    console.group();
    console.error('$stateChangeError', error);
    console.error(error.stack);
    console.info('event', event);
    console.info('toState', toState);
    console.info('toParams', toParams);
    console.info('fromState', fromState);
    console.info('fromParams', fromParams);
    console.groupEnd();
  });
}

app.config(ConfigBlock);

ConfigBlock.$inject = ['$stateProvider', '$urlRouterProvider'];

function ConfigBlock($stateProvider, $urlRouterProvider) {

  logMilestone("Config");

  var HomeState = {
    name: 'home',
    url: '/',
    template: '<ui-view></ui-view>'
  };

  var VolunteerListState = {
    name: 'volunteerList',
    url: '/volunteer/',
    templateUrl: 'views/volunteerList.html',
    controller: VolunteerListController
  }

  var VolunteerViewState = {
    name: 'volunteerView',
    url: '/volunteer/:volunteerId',
    templateUrl: 'views/volunteerView.html',
    controller: VolunteerController
  }

  $stateProvider.state('home', HomeState);
  $stateProvider.state('volunteerList', VolunteerListState);
  $stateProvider.state('volunteerView', VolunteerViewState);
  $urlRouterProvider.otherwise('/volunteer/');
}

function VolunteerListController($scope, Person) {
  logMilestone("Volunteer List Controller");
  var ctrl = this;
  Person.find({}, function(volunteers) {
    $scope.volunteers = volunteers;
    console.log($scope.volunteers);
  }, function(error) {
    console.error(error);
  });
}

function VolunteerController($stateParams, $scope, Person, Attendance, createChangeStream, LiveSet) {
  logMilestone("Volunteer Controller");
  var ctrl = this;
  console.log($stateParams);
  var changes = createChangeStream();
  var set;

  Person.findById({
    id: $stateParams.volunteerId
  }, function(volunteer) {
    $scope.volunteer = volunteer;
    console.log($scope.volunteer);

  }, function(error) {
    console.error(error);
  });

  Attendance.find({
    filter: {
      where: {
        personId: $stateParams.volunteerId
      }
    }
  }).$promise.then(function(attendances) {
    var src = new EventSource('/api/Attendances/change-stream');
    var changes = createChangeStream(src);
    set = new LiveSet(attendances, changes);
    console.log(set);
    $scope.attendances = set.toLiveArray();
    console.log($scope.attendances);
  });
}

function NavbarController($stateParams, $state, $cookies, LoopBackAuth, User) {
  logMilestone("Navbar Controller");
  var ctrl = this;
  LoopBackAuth.rememberMe = true;
  LoopBackAuth.currentUserId = $cookies.get('userId');
  LoopBackAuth.accessTokenId = $cookies.get('access_token');
  console.log(LoopBackAuth);
  LoopBackAuth.save();
  console.log(LoopBackAuth);
  console.log(User.isAuthenticated());

  ctrl.logMeOut = function() {
    console.log(LoopBackAuth);
    LoopBackAuth.clearUser();
    console.log(LoopBackAuth);
    // LoopBackAuth.save();
    // LoopBackAuth.clearStorage();
    // console.log(LoopBackAuth);
    ctrl.user = {};
    $cookies.remove('access_token');
  }
}

app.controller('NavbarController', NavbarController);
