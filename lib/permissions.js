//Devuelve true o false si hay un post y ademas eres el dueño del mismo
//(se pasan userId y post como parametros)
ownsDocument = function(userId, doc) {
  return doc && doc.userId === userId;
}