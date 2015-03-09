Template.header.helpers({
  activeRouteClass: function(/* route names */) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop(); //Aclarado mas abajo. Es para eliminar el hash que añade Spacebars

    var active = _.any(args, function(name) { //_.any == _.some
      return Router.current() && Router.current().route.getName() === name
    });

    return active && 'active';
  }
});
/*Para cada elemento, el ayudante activeRouteClass toma una lista de nombres de ruta, y luego utiliza el ayudante any() de Underscore para ver si las rutas pasan la prueba (es decir, que su correspondiente URL sea igual a la actual). Si cualquiera de las rutas se corresponde con la actual, any() devolverá true.

/////// AQUI LA CLAVE !!!
Por último, estamos aprovechando el patrón boolean && myString de JavaScript con el que false && myString devuelve false, pero los true && myString devuelve myString.*/

/* PARAMETROS EN LOS AYUDANTES
Hasta ahora no hemos usado este modelo en concreto, pero al igual que para cualquier otro tag de Spacebars, los tags de los ayudantes de plantilla también pueden tomar argumentos.

Y aunque por supuesto, se pueden pasar argumentos específicos a la función, también se pueden pasar un número indeterminado de ellos y recuperarlos mediante una llamada al objeto arguments dentro de la función.

En este último caso, es probable que queramos convertir el objeto arguments a un array JavaScript y luego llamar a pop() sobre él para deshacernos del hash que añade Spacebars.
*/
