Template.postEdit.created = function() {
  Session.set('postEditErrors', {});
}

Template.postEdit.helpers({
  errorMessage: function(field) {
    return Session.get('postEditErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
  }
});

Template.postEdit.events({
  'submit form': function(e) {
    e.preventDefault();

    var currentPostId = this._id; //Es this._id !! viene del router (es el post actual)

    var postProperties = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val()
    }
    
    var errors = validatePost(postProperties);
    if (errors.title || errors.url)
      return Session.set('postEditErrors', errors);

    if (Posts.findOne({url: postProperties.url})){
        throwError('post duplicado');
    } else {    
    //funcion que reemplaza un conjunto de atributos dejando los demás intactos
    //Lleva 3 parametros, el ultimo un callback para llevar al user donde proceda o tratar el error
      Posts.update(currentPostId, {$set: postProperties}, function(error) {      
        if (error) {
          // display the error to the user
          throwError(error.reason);
        } else {
          Router.go('postPage', {_id: currentPostId});
        }
      });
    }
  },

  'click .delete': function(e) {
    e.preventDefault();

    if (confirm("Delete this post?")) {
      var currentPostId = this._id;
      Posts.remove(currentPostId);
      Router.go('home');
    }
  }
});