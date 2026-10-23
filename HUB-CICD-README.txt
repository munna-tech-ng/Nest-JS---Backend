Hub CI/CD pack (nestjs, adapt=repo)
==============

Source: repo-aware adapt (stack=nestjs). Notes:
  - Adapted app port 3000, health /health, image ghcr.io/munna-tech-ng/nest-js---backend.
  - OpenAI refined allow-listed pack files from repo excerpts.

1. Set the Hub project image_repository to: ghcr.io/munna-tech-ng/nest-js---backend
2. Copy these files into your GitHub repository (commit + push).
3. Add GitHub Actions secrets (Settings → Secrets and variables → Actions):
   - HUB_API_URL = your Hub API base URL (e.g. https://hub.example.com)
   - HUB_BUILD_TOKEN = operator PAT that can POST /v1/projects/:id/builds
4. Add GitHub Actions variable:
   - HUB_PROJECT_ID = 01a13f82-81de-78bf-b346-24f9e47f7a32
5. Ensure .env.example matches the stack pack non-secret keys (no real secrets).
6. In Hub, open the project and click Re-check CI/CD.

Hub never writes secret values for you. Check CI/CD verifies secret/variable names (and HUB_PROJECT_ID value) when the GitHub App can read Actions config; OpenAI only explains gaps.

Extra unrelated workflows are warnings only; Hub requires hub-deploy.yml + compose (except custom stack).
