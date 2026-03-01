"""
AI Worker — placeholder entrypoint.
Connects to Redis and waits for jobs from the Laravel queue.
Replace this with your actual AI logic.
"""
import os
import time
import redis


def main():
    redis_host = os.getenv("REDIS_HOST", "redis")
    redis_port = int(os.getenv("REDIS_PORT", 6379))

    print(f"[ai_worker] Connecting to Redis at {redis_host}:{redis_port} ...")
    r = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
    r.ping()
    print("[ai_worker] Connected. Waiting for jobs ...")

    # Simple blocking loop — replace with your real worker logic
    while True:
        # Example: BLPOP from a Laravel-dispatched queue
        job = r.blpop("queues:ai", timeout=5)
        if job:
            _, payload = job
            print(f"[ai_worker] Received job: {payload}")
            # TODO: process the job with your AI model
        # (loop continues waiting)


if __name__ == "__main__":
    main()
