Items = new Mongo.Collection("items");

Items.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: 'Name'
  }
}));

Items.allow({
  insert: function(){
    return true;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true;
  }
});


if (Meteor.isClient) {
  angular.module('meteorIssues', ['angular-meteor'])
    .controller('SampleCtrl', [
      '$scope', '$timeout', function($scope, $timeout){
        $scope.$meteorSubscribe('items').then(function(){
          // Try saving an invalid document (one that has no 'name' propery)
          // will throw Error: [$rootScope:inprog] $digest already in progress
          $scope.$meteorCollection(Items).save({description: 'hello ther'}).then(function(){
            console.log("this will not be reached");
          });
        });
      }
    ]);


  //Logging messages to console stuff
  var _send,
  slice = [].slice;

  _send = Meteor.connection._send;

  Meteor.connection._send = function() {
    console.log('send', arguments);
    _send.call.apply(_send, [this].concat(slice.call(arguments)));
  };

  Meteor.connection._stream.on('message', function(message) {
    console.log('receive', JSON.parse(message));
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    if (Items.find({}).count() === 0) {
      Items.insert({name: 'Some item'})
    }
  });

  Meteor.publish("items", function(){
    return Items.find({});
  });
}
