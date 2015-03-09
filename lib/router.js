/*GENERAL*/
Router.configure({
  layoutTemplate: 'layout', //de layout.html !!
  loadingTemplate: 'loading', //de includes/loading.html !!
  notFoundTemplate: 'notFound',
  //carga (se suscribe) todos los posts (coleccion posts) al inicio. Estan disponibles desde el principio, asi que no hay tiempo de carga entre cambios de paginas !
  waitOn: function() {
    return [Meteor.subscribe('notifications')]
  }
});

/**RUTAS**
**********/
Router.route('/posts/:_id', {
  name: 'postPage',
  waitOn: function() { //carga los comentarios y el post
    return [
      Meteor.subscribe('comments', this.params._id),
      Meteor.subscribe('singlePost', this.params._id)
    ];
  },
  data: function() { return Posts.findOne(this.params._id);
}});
Router.route('/submit', {name: 'postSubmit'});
Router.route('/posts/:_id/edit', {
  name: 'postEdit',
  waitOn: function() {
    return Meteor.subscribe('singlePost', this.params._id);
  },
  data: function() { return Posts.findOne(this.params._id); }
});

//Controlador de ruta (template) aprovechable en mas rutas para no repetir codigo DRY
//Extendemos de RouteController ! (ver abajo la ruta comentada cómo se fue construyendo)
PostsListController = RouteController.extend({
  template: 'postsList',
  increment: 5,
  postsLimit: function() {
    return parseInt(this.params.postsLimit) || this.increment;
  },
  findOptions: function() {
    return {sort: this.sort, limit: this.postsLimit()};
    //return {sort: {submitted: -1}, limit: this.postsLimit()};
  },
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },
  /*waitOn: function() {
    return Meteor.subscribe('posts', this.findOptions());
  }, Mejor que no espere para mejorar experiencia de usuario */
  posts: function() {
    return Posts.find({}, this.findOptions());
  },
  data: function() {
    var hasMore = this.posts().count() === this.postsLimit();
    var nextPath = this.route.path({postsLimit: this.postsLimit() + this.increment});
    return {
      posts: this.posts(),
      ready: this.postsSub.ready, //inidca cuando la suscripción ha terminado de cargar (de subscriptions)
      nextPath: hasMore ? this.nextPath() : null
    };
  //si pedimos n posts y obtenemos n, seguiremos mostrando el botón “Load more”. Pero si pedimos n y tenemos menos de n, significa que hemos llegado al límite y deberíamos dejar de mostrarlo.   
  }
});
//Extensión de PostsListController
NewPostsController = PostsListController.extend({
  sort: {submitted: -1, _id: -1}, //ordenado por fecha de envio e id
  nextPath: function() {
    return Router.routes.newPosts.path({postsLimit: this.postsLimit() + this.increment})
  }
});
BestPostsController = PostsListController.extend({
  sort: {votes: -1, submitted: -1, _id: -1}, //ordenado por votos, fecha e id
  nextPath: function() {
    return Router.routes.bestPosts.path({postsLimit: this.postsLimit() + this.increment})
  }
});


//Ruta mas generica al final ;)
/*Router.route('/:postsLimit?', {
  name: 'postsList',
  controller: NewPostsController
  /*name: 'postsList',
  waitOn: function() {
    var limit = parseInt(this.params.postsLimit) || 5; //si no se pasa valor (acceso a / directamente le cascamos un 5 predeterminado !)
    return Meteor.subscribe('posts', {sort: {submitted: -1}, limit: limit});
  },
  //en lugar de disponer implícitamente de los datos en this dentro de la plantilla, estará disponible también como posts
  data: function() {
    var limit = parseInt(this.params.postsLimit) || 5;
    return {
      posts: Posts.find({}, {sort: {submitted: -1}, limit: limit})
    };
  }*/
/*});*/
Router.route('/', {
  name: 'home',
  controller: NewPostsController
});
Router.route('/new/:postsLimit?', {name: 'newPosts'});
Router.route('/best/:postsLimit?', {name: 'bestPosts'});
/*************************************/

/*RESTRICCIONES (REGLAS)*/
var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      //para que no muestre primero la plantilla accesDenied (hasta que no sepa si esta o no logueado -hable con el server- no lo confirmara, asi que se puede ver durante una milesima de segundo.) Para evitarlo, renderizamos un "loadingTemplate"
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');  //access_denied.html
    }
  } else {
    this.next();
  }
}
Router.onBeforeAction(requireLogin, {only: 'postSubmit'}); //Reglas definidas en la funcion requireLogin definida arriba
Router.onBeforeAction('dataNotFound', {only: 'postPage'}); //Por si introduce una ruta valida pero con un id inexistente ! (tira del template notFound tambien !!)