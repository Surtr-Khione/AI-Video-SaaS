#!/bin/bash

echo "🎬 Setting up AI Video SaaS..."

# Check prerequisites
echo "Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo "⚠️  Warning: FFmpeg is not installed. Video processing will fail." >&2; }

echo "✅ Prerequisites check complete"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up environment file
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp .env.example .env
  echo "⚠️  Please update .env with your database and Redis configuration"
else
  echo "✅ .env file already exists"
fi

# Create directories
echo "📁 Creating directories..."
mkdir -p uploads output

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your PostgreSQL and Redis configuration"
echo "2. Run 'npm run db:push' to set up the database"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Run 'npm run worker' in a separate terminal to start the worker"
echo ""
echo "For production deployment, see README.md"
