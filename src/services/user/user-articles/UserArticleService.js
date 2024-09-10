import axiosInstance from "@/services/core/axios/axiosInstance";


export default class UserArticleService {
    APP_CONFIG;
    ARTICLES_ENDPOINT;

    static instance;

    constructor(config) {
        this.APP_CONFIG = config;
        this.ARTICLES_ENDPOINT = `${config?.apiBaseUrl}/article`;
    }

    /**
     *
     *
     * ARTICLES SECTION
     *
     * **/

    static getInstance(config) {
        if (!UserArticleService.instance) {
            if (!config) {
                throw new Error('Configuration must be provided to initialize the UserArticleService');
            }
            UserArticleService.instance = new UserArticleService(config);
        }
        return UserArticleService.instance;
    }

    async createArticle(article) {
        try {
            const response = await axiosInstance.post(this.ARTICLES_ENDPOINT, {
                "publicStatus": article.publicStatus,
                "title": article.title,
                "body": article.body,
                "articleMedias": article.articleMedias,
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async updateArticle(article) {
        try {
            const response = await axiosInstance.put(`${this.ARTICLES_ENDPOINT}/${article.id}`, {
                publicStatus: article.publicStatus,
                title: article.title,
                body: article.body,
                //no article media update implemented in backend...
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async deleteArticle(articleId) {
        try {
            const response = await axiosInstance.delete(`${this.ARTICLES_ENDPOINT}/${articleId}`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async findArticleById(articleId) {
        try {
            const response = await axiosInstance.get(`${this.ARTICLES_ENDPOINT}/${articleId}`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async countAllArticleComments(articleId) {
        try {
            const response = await axiosInstance.get(`${this.ARTICLES_ENDPOINT}/${articleId}/comment/count`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async listAllArticlesByUserId(userId,
                                  page = 0,
                                  size = 15,
                                  sortBy = 'id',
                                  order = 'desc') {

        try {
            const response = await axiosInstance.get(`${this.ARTICLES_ENDPOINT}/user/${userId}`, {
                params: {
                    page,
                    size,
                    sortBy,
                    order
                }
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    //all articles current logged-in user can access (also all public articles from other users)
    async listAllArticles(page = 0,
                          size = 15,
                          sortBy = 'id',
                          order = 'desc') {
        try {
            const response = await axiosInstance.get(this.ARTICLES_ENDPOINT, {
                params: {
                    page,
                    size,
                    sortBy,
                    order
                }
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async createArticleReaction(articleId, reaction) {
        try {
            const response = await axiosInstance.post(`${this.ARTICLES_ENDPOINT}/${articleId}/reaction`, {
                reaction: {
                    alias: reaction.alias
                }
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async deleteArticleReaction(articleId) {
        try {
            const response = await axiosInstance.delete(`${this.ARTICLES_ENDPOINT}/${articleId}/reaction`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }


    /**
     *
     *
     * ARTICLES COMMENTS SECTION
     *
     * **/

    async createComment(articleId, articleComment) {
        try {
            const response = await axiosInstance.post(`${this.ARTICLES_ENDPOINT}/${articleId}/comment`, {
                comment: articleComment.comment
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async updateComment(articleId, articleComment) {
        try {
            const response = await axiosInstance.post(`${this.ARTICLES_ENDPOINT}/${articleId}/comment/${articleComment.id}`, {
                comment: articleComment.comment
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async deleteComment(articleId, commentId) {
        try {
            const response = await axiosInstance.delete(`${this.ARTICLES_ENDPOINT}/${articleId}/comment/${commentId}`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async createCommentReaction(articleId, commentId, reaction) {
        try {
            const response = await axiosInstance.post(`${this.ARTICLES_ENDPOINT}/${articleId}/comment/${commentId}/reaction`, {
                reaction: {
                    alias: reaction.alias
                }
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async deleteCommentReaction(articleId, commentId) {
        try {
            const response = await axiosInstance.delete(`${this.ARTICLES_ENDPOINT}/${articleId}/comment/${commentId}/reaction`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async findCommentByArticleIdAndCommentId(articleId, commentId) {
        try {
            const response = await axiosInstance.get(`${this.ARTICLES_ENDPOINT}/${articleId}/comment/${commentId}`)
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async listAllArticleComments(articleId,
                                 page = 0,
                                 size = 15,
                                 sortBy = 'id',
                                 order = 'asc') {
        try {
            const response = await axiosInstance.get(`${this.ARTICLES_ENDPOINT}/${articleId}/comment`, {
                params: {
                    page,
                    size,
                    sortBy,
                    order
                }
            })
            return response.data;
        } catch (e) {
            return Promise.reject(e)
        }
    }
}