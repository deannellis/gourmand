const app = require('./app');

app.listen(process.env.PORT || 7777, () => {
    console.log(
        `App is running on port ${process.env.PORT}` + '\n' +'\n' +
        '   (         )      ' + '\n' +
        '    )       (       ' + '\n' +
        '// ""--.._' + '\n' +
        '||  (_)  _ "-._' + '\n' +
        '||    _ (_)    \'-.' + '\n' +
        '||   (_)   __..-\'' + '\n' +
        ' \\\\ __..--\"\"' + '\n' 
    );
});