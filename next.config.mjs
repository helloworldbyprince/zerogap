import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  serverExternalPackages: [
    '@google-cloud/documentai',
    '@google-cloud/storage',
    '@google-cloud/firestore',
    '@google-cloud/bigquery',
    '@google-cloud/vertexai',
    'google-gax',
  ],
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

export default nextConfig;
