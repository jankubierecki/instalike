class Serializer {
    serializePost(post) {

        return {
            "id": post.id,
            "email": post.email,
            "authorID": post.userID,
            "title": post.title,
            "description": post.description,
            "createdAt": post.createdAt,
            "fotoUrl": '/posts/uploads/posts/' + post.fotoPath.split('/').pop()


        }
    }

    serializeUser(user) {
        return {
            "id": user.id,
            "email": user.email
        }
    }
}

module.exports = new Serializer();
