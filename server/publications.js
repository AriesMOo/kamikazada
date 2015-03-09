Meteor.publish('posts', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });
  return Posts.find({}, options);
});

Meteor.publish('singlePost', function(id) {
  check(id, String)
  return Posts.find(id);
});

//Aqui ya no devolvemos todos los comentarios. Solo los que se correspondan con el postId de cada pagina
Meteor.publish('comments', function(postId) {
  check(postId, String); //existe postId?
  return Comments.find({postId: postId});
});

//devuelve solo las notificaciones que corresponden al usuario de turno y que no esten leidas off-course !
Meteor.publish('notifications', function() {
  return Notifications.find({userId: this.userId, read: false});
});