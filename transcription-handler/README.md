# Transcription Handler

## Start

```bash
python transcription-handler.py
```

## Test

Trigger the 'work' intent by running

```bash
curl localhost:5000/recommendation/ -d "Github issue"
```

Then the next request will be searched for keywords, to return relevant recommendations

```bash
curl localhost:5000/recommendation/ -d "tinder one two three"
```

This request should return data