#!/bin/bash
# Kill processes running on development ports 3000-3006

echo "🔍 Checking for processes on ports 3000-3006..."

for port in {3000..3006}; do
  pid=$(lsof -ti:$port)
  if [ ! -z "$pid" ]; then
    echo "⚠️  Found process on port $port (PID: $pid)"
    kill -9 $pid 2>/dev/null
    if [ $? -eq 0 ]; then
      echo "✅ Killed process on port $port"
    else
      echo "❌ Failed to kill process on port $port"
    fi
  fi
done

echo ""
echo "✅ Port cleanup complete!"
echo ""
echo "Verifying ports are clear..."
for port in {3000..3006}; do
  pid=$(lsof -ti:$port)
  if [ ! -z "$pid" ]; then
    echo "⚠️  Port $port still in use by PID $pid"
  fi
done

echo "Done!"
