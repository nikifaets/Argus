# RASA

## Install

From the poetry shell, run
```bash
python -m spacy download en_core_web_md
```

## Training

From the poetry shell in this directory, run 

```bash
rasa train
```

## Start

Then start the server with

```bash
rasa run --enable-api -m models/nlu-20210925-214319.tar.gz
```

## Test

```bash
curl localhost:5005/model/parse -d '{"text":"Hey Jake how are you"}'
```
