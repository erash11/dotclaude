#!/usr/bin/env python3
"""Semantic web search via the Exa API. Stdlib only.

Usage:
  python exa_search.py "query" [--num 5] [--type auto] [--contents highlights]
                       [--include-domains a.com,b.com] [--exclude-domains ...]
                       [--since YYYY-MM-DD] [--category "research paper"] [--json]
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

API_URL = "https://api.exa.ai/search"


def load_key(name):
    val = os.environ.get(name)
    if val:
        return val.strip()
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith(name + "="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit(f"ERROR: API key not found. Set {name} env var or add it to {env_path}")


def main():
    p = argparse.ArgumentParser(description="Exa semantic search")
    p.add_argument("query")
    p.add_argument("--num", type=int, default=5)
    p.add_argument("--type", default="auto", choices=["auto", "fast", "neural", "keyword", "instant"])
    p.add_argument("--contents", default="highlights", choices=["text", "highlights", "none"])
    p.add_argument("--include-domains", default=None)
    p.add_argument("--exclude-domains", default=None)
    p.add_argument("--since", default=None, help="YYYY-MM-DD published-after filter")
    p.add_argument("--category", default=None)
    p.add_argument("--json", action="store_true", help="dump raw JSON response")
    args = p.parse_args()

    body = {"query": args.query, "type": args.type, "numResults": args.num}
    if args.contents == "text":
        body["contents"] = {"text": {"maxCharacters": 8000}}
    elif args.contents == "highlights":
        body["contents"] = {"highlights": {"maxCharacters": 2000}}
    if args.include_domains:
        body["includeDomains"] = [d.strip() for d in args.include_domains.split(",")]
    if args.exclude_domains:
        body["excludeDomains"] = [d.strip() for d in args.exclude_domains.split(",")]
    if args.since:
        body["startPublishedDate"] = args.since + "T00:00:00.000Z"
    if args.category:
        body["category"] = args.category

    req = urllib.request.Request(
        API_URL,
        data=json.dumps(body).encode(),
        headers={"x-api-key": load_key("EXA_API_KEY"), "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"ERROR: HTTP {e.code} from Exa: {e.read().decode(errors='replace')[:500]}")
    except urllib.error.URLError as e:
        sys.exit(f"ERROR: network failure reaching Exa: {e.reason}")

    if args.json:
        print(json.dumps(data, indent=2))
        return

    results = data.get("results", [])
    if not results:
        print("No results.")
        return
    for i, r in enumerate(results, 1):
        print(f"## {i}. {r.get('title') or '(untitled)'}")
        print(f"URL: {r.get('url')}")
        if r.get("publishedDate"):
            print(f"Published: {r['publishedDate'][:10]}")
        if r.get("author"):
            print(f"Author: {r['author']}")
        if r.get("highlights"):
            for h in r["highlights"]:
                print(f"> {h.strip()}")
        elif r.get("text"):
            print(r["text"].strip())
        print()


if __name__ == "__main__":
    main()
