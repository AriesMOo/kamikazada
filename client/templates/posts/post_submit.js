Template.postSubmit.created = function() {
  Session.set('postSubmitErrors', {});
}

Template.postSubmit.helpers({
  errorMessage: function(field) {
    return Session.get('postSubmitErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('postSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.postSubmit.events({
  'submit form': function(e) {
    e.preventDefault();

    var post = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val()
    };
    
    var errors = validatePost(post);  //en lib/collections/posts.js
    if (errors.title || errors.url)
      return Session.set('postSubmitErrors', errors); //termina la ejecucion si hay errores con el return

    //Inserción con método (llamada a postinsert, con parametros post y un callback que se ejecuta al terminar postInsert)
    Meteor.call('postInsert', post, function(error, result) {
      // display the error to the user and abort
      if (error)
        return throwError(error.reason);
      
      // show this result but route anyway
      if (result.postExists)
        throwError('Este link ya ha sido posteado');
      
      Router.go('postPage', {_id: result._id}); //el id aqui lo pasamos a "mano"
    });
    
    //post._id = Posts.insert(post); // La función insert() devuelve el identificador _id del objeto que se ha insertado en la base de datos
    //Router.go('postPage', post._id)
  }
});