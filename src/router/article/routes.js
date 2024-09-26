import ArticleView from "@/views/article/ArticleView.vue";

const routes = [
    {
        path: '/article/:articleId',
        name: 'article',
        component: ArticleView,
        meta:{requiresAuth: true},
    },
    {
        path: '/article',
        name: 'article-invalid',
        component: ArticleView,
        meta:{requiresAuth: true},
    },
];

export default routes;
