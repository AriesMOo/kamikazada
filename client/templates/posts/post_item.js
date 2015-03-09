Template.postItem.helpers({
  //Devuelve true si el userid actual es el userid del post que hay que tratar
  ownPost: function() {
    return this.userId === Meteor.userId();
  },
  domain: function() {
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  },
  upvotedClass: function() {
    var userId = Meteor.userId();
    if (userId && !_.include(this.upvoters, userId)) { //_.include == contains
      return 'btn-primary upvotable';
    } else {
      return 'disabled';
    }
  }
});

/*
Magia JavaScript
Estamos creando un elemento HTML ancla (a) vacío y lo almacenamos en la memoria.

A continuación, establecemos el atributo href para que sea igual a la URL del post actual (como acabamos de ver, en un ayudante, this es el objeto que se está usando en este momento).

Por último, aprovechamos la propiedad hostname del elemento a para devolver el nombre de dominio del post sin el resto de la URL.
*/

Template.postItem.events({
  'click .upvotable': function(e) {
    e.preventDefault();
    Meteor.call('upvote', this._id);
  }
});