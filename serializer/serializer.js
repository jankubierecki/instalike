class Serializer {
    serializePost(post) {

        return {
            "id": post.id,
            "authorID": post.userID,
            "title": post.title,
            "description": post.description,
            "createdAt": post.createdAt,
            "fotoUrl": '/posts/uploads/posts/' + post.fotoPath.split('/').pop()


        }
    }
}

module.exports = new Serializer();
