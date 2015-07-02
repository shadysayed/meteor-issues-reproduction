Items = new Mongo.Collection("items");

///////////// Add updatedAt/createdAt properties
Items.before.insert(function(userId, doc) {
  doc.createdAt = new Date();
  doc.updatedAt = doc.createdAt;
});
Items.before.update(function(userId, doc, fieldNames, modifier, options){
  if (modifier.$set == null) {
      modifier.$set = {};
    }
    return modifier.$set.updatedAt = new Date();
});

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
          //Just get an item
          $scope.item = $scope.$meteorObject(Items, Items.find({}).fetch()[0]._id)
          // Simulate user editing in a few seconds
          $timeout(function(){
            //an infinite update will happen after the following line because the client and server will keep disagreeing on the value of updatedAt.
            $scope.item.name = "changed name";
          }, 3000);
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
