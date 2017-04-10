'use strict';

module.exports = function(Person) {
  var app = require('../../server/server');
  var Attendance = app.models.Attendance;

  Person.signIn = function(personId, cb) {
    Person.findById(personId)
      .then(function(person) {
        person.attendances.create({}, function(err, attendance) {
          console.error(err);
          console.log(attendance);
          return cb(null, attendance);
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
        person.attendances.findOne({where:{endDate:null}, order:'startDate DESC'}, function(err, attendance) {
          console.error(err);
          console.log(attendance);
          var endDate = new Date();
          console.log(endDate);
          attendance.updateAttribute('endDate', endDate, function(err, attendance){
            console.error(err);
            console.log(attendance);
          })
          return cb(null, attendance);
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
