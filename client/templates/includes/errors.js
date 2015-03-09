Template.errors.helpers({
  errors: function() {
    return Errors.find();
  }
});

Template.error.rendered = function() {
  var error = this.data;
  Meteor.setTimeout(function () {
    Errors.remove(error._id);
  }, 3000);
};
/*La llamada a rendered se lanza una vez que nuestra plantilla ha sido renderizada en el navegador. Dentro de esta llamada, this hace referencia a la actual instancia de la plantilla, y this.data nos da acceso a los datos del objeto que está siendo actualmente renderizado (en nuestro caso, un error).*/