Posts = new Mongo.Collection('posts');

Posts.allow({
  //Esto ahora no hace falta con el METODO de abajo ????
  /*insert: function(userId, doc) {
    // only allow posting if you are logged in, es decir, si tienes userId
    return !! userId;
  },*/
  update: function(userId, post) { return ownsDocument(userId, post); },
  remove: function(userId, post) { return ownsDocument(userId, post); },
  /*ownDocument es una funcion definida en permissions.js
  Se editan y se eliminan posts desde el cliente, asi que se debe permitir aqui
  si no se crean MÉTODOS especificos !*/
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    //para que no editen otros campos, por ejemplo que cambien de dueño al post!
    return (_.without(fieldNames, 'url', 'title').length > 0);
    /*Estamos cogiendo el array fieldNames que contiene la lista de los campos que quieren modificar, y usamos el método without() de Underscore para devolver un sub-array que contiene los campos que no son url o title. Si todo ok, el array debe estar vacio y la longitud debe ser 0. Si alguien esta 
    intentando joder algo que no debe, la longitud sera > 0 y será denegado !*/
  }
});

//ver en http://es.discovermeteor.com/chapters/errors/ al final
//(como en Posts.update({$set: {title: ..., url: ...}})).
//modifier.$set contiene las mismas dos propiedades title y url que el objeto post
Posts.deny({
  update: function(userId, post, fieldNames, modifier) {
    var errors = validatePost(modifier.$set); //es la funcion de abajo !!
    return errors.title || errors.url;
  }
});

validatePost = function (post) {
  var errors = {};
  if (!post.title)
    errors.title = "Por favor, pon un título !";
  if (!post.url)
    errors.url =  "Por favor, pon un URL !";
  return errors;
}

//Paquete audit-argument-checks
Meteor.methods({
  postInsert: function(postAttributes) {
    check(Meteor.userId(), String); //solo tendra userId() si en esa sesion se ha validado como usuario
    check(postAttributes, {
      title: String,
      url: String
    }); //Se comprueba q el userID sea un String y que los atributos del envio post sean title y url (strings)
    
    //Validacion en el servidor (usando la funcion de arriba) IMPORTANTE !!!
    //se prueba con Meteor.call('postInsert', {url: '', title: 'No URL here!'});
    var errors = validatePost(postAttributes);
    if (errors.title || errors.url)
      throw new Meteor.Error('invalid-post', "Debes escribir un título y una URL en tu entrada");
    
    //evitar posts con urls duplicadas ! hay un return asi que no sigue la ejecucion si encuentra duplicidades !
    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }
    
    var user = Meteor.user();
    var post = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      commentsCount: 0 //por defecto 0 comentarios para los nuevos posts
    });
    //El _.extend es de underscore y extiende un objeto con más atributos ;) -fecha y datos del autor-
    var postId = Posts.insert(post);
    return {
      _id: postId
    };
  },
  
  upvote: function(postId) {
    check(this.userId, String);
    check(postId, String);
    //Se propone la forma de abajo, pq esto puede dar condiciones de carrera
    /*var post = Posts.findOne(postId);
    if (!post)
      throw new Meteor.Error('invalid', 'Entrada no encontrada');
    if (_.include(post.upvoters, this.userId)) //_.include == _.contains !! 
      throw new Meteor.Error('invalid', 'Ya has votado por esta entrada');
    Posts.update(post._id, {
      $addToSet: {upvoters: this.userId}, //$addToSet agrega un elemento a una lista siempre y cuando éste no esté ya en ella (Mongo pow@ !!)
      $inc: {votes: 1} //$inc simplemente incrementa un entero.*/
    
    //Se combinan dos acciones en una (no como arriba). Encuentra todos los posts con este id que todavía no hayan sido votados por este usuario, y actualízalos
    var affected = Posts.update({
      _id: postId,
      upvoters: {$ne: this.userId} //$ne selecciona todos los docs que NO coincidan con userId
    }, {
      $addToSet: {upvoters: this.userId},
      $inc: {votes: 1}
    });
    if (! affected)
      throw new Meteor.Error('invalid', "No hemos sido capaces de registrar tu voto :(");
  }  
});