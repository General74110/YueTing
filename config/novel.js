module.exports = {
    site: 'yuetingba',

    id: 'yuetingba_xian_ni',
    title: '仙逆',
    author: '耳根',
    speaker: '边江工作室',

    bookId: '3a1c0235-9335-5f9b-b236-e3b92dda9baa',

    // 播放页模板
    playUrl(skip) {
        return `http://www.yuetingba.cn/book/detail/${this.bookId}/${skip}`;
    },

    startSkip: 0,
    maxEmptyRetry: 3
};