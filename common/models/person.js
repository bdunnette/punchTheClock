'use strict';

var moment = require('moment');

module.exports = function(Person) {
  var app = require('../../server/server');
  var Attendance = app.models.Attendance;

  Person.signIn = function(personId, cb) {
    Person.findById(personId)
      .then(function(person) {
        // Look for open attendance (i.e. one with no end date) for the volunteer
        person.attendances.findOne({
          where: {
            endDate: null
          },
          order: 'startDate DESC'
        }).then(function(attendance) {
          // If open attendance is found, just return that
          if (attendance) {
            return cb(null, attendance);
          } else {
            // Otherwise, create new attendance
            person.attendances.create({}).then(function(attendance) {
              console.log(attendance);
              return cb(null, attendance);
            })
          }
        }).catch(function(err) {
          console.log(err);
          return cb(err, null);
        });
      })
      .catch(function(err) {
        var error = new Error("Person not found with ID " + personId);
        // error.statusCode = 400;
        return cb(error, null);
      })
  }

  Person.signOut = function(personId, cb) {
    Person.findById(personId)
      .then(function(person) {
        // Look for open attendance (i.e. one with no end date) for the volunteer
        person.attendances.findOne({
          where: {
            endDate: null
          },
          order: 'startDate DESC'
        }).then(function(attendance) {
          // If open attendance is found, set its end date to now
          var endDate = new Date();
          // Calculate difference (in milliseconds!) between start & end dates
          var duration = moment(endDate).diff(attendance.startDate);
          attendance.updateAttributes({
            'endDate': endDate,
            'duration': duration
          }, function(err, attendance) {
            return cb(err, attendance);
          })
        }).catch(function(err) {
          var error = new Error("Unable to find open attendance for volunteer ID " + personId);
          return cb(error, null);
        });
      })
      .catch(function(err) {
        var error = new Error("Person not found with ID " + personId);
        // error.statusCode = 400;
        return cb(error, null);
      })
  }

  Person.remoteMethod('signIn', {
    accepts: {
      arg: 'personId',
      type: 'string'
    },
    returns: {
      arg: 'status',
      type: 'string'
    }
  });

  Person.remoteMethod('signOut', {
    accepts: {
      arg: 'personId',
      type: 'string'
    },
    returns: {
      arg: 'status',
      type: 'string'
    }
  });
}
