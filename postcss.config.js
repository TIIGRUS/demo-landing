export default {
    plugins: {
        'postcss-preset-env': {
            stage: 3,
            features: {
                'nesting-rules': true,
                'custom-media-queries': {
                    preserve: false,
                },
                // TODO: Раскомментировать, чтобы не добавлялся фоллбек для кастомных свойств
                // "custom-properties": false,
            },
        },
        autoprefixer: {},
        cssnano: process.env.NODE_ENV === 'production' ? {} : false,
    },
};
