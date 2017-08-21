class Serializer {
    serializePost(post) {
        return {
            "id": post.id,
            "email": post.email,
            "authorID": post.userID,
            "title": post.title,
            "description": post.description,
            "createdAt": post.createdAt,
            "commentsCount": post.commentsCount,
            "fotoUrl": '/posts/uploads/posts/' + post.fotoPath.split('/').pop()


        }
    }

    serializeUser(user) {
        return {
            "id": user.id,
            "email": user.email
        }
    }

    serializeComment(comment) {
        return {
            "id": comment.id,
            "email": comment.email,
            "authorID": comment.userID,
            "title": comment.title,
            "description": comment.description,
            "createdAt": comment.createdAt,

        }
    }
}

module.exports = new Serializer();
