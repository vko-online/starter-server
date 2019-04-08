## App server companion


### Environment vars
copy __.env.example__ to __.env__

    SEED=false
    JWT_SECRET=your_secret
    HOST_URL=localhost
    MONGODB_URL=mongodb://127.0.0.1:27017/your_mongo_url


### Commands

- `yarn start` - Run server
- `yarn watch` - Run server and watch file changes

### BA

- вопрос: в графике показываем изменения цен, это цена прошедших сделок(продаж/покупок) или цена за продукт которую ввел админ (через excel файл например)
