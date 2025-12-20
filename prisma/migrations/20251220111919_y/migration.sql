-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('NOTE', 'DOCUMENT', 'DRAWING', 'DESIGN', 'STICKY_NOTES', 'MIND_MAP', 'RAG', 'RESEARCH_PAPER', 'FLIPBOOK', 'PRESENTATION');

-- CreateEnum
CREATE TYPE "PresentationStatus" AS ENUM ('DRAFT', 'OUTLINE', 'CONTENT', 'FAILED');

-- CreateEnum
CREATE TYPE "PresentationThemeType" AS ENUM ('SYSTEM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ImageLibraryType" AS ENUM ('UPLOADED', 'AI');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "user_id" TEXT NOT NULL,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "headline" TEXT,
    "language" TEXT DEFAULT 'en',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "has_access" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "interests" TEXT[],
    "location" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail_url" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "base_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presentations" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_source" TEXT NOT NULL DEFAULT 'ai',
    "prompt" TEXT,
    "model_provider" TEXT,
    "model_id" TEXT,
    "page_style" TEXT,
    "num_slides" INTEGER,
    "tone" TEXT,
    "language" TEXT DEFAULT 'zh',
    "outline" TEXT[],
    "search_results" JSONB,
    "template_id" TEXT,
    "theme_id" TEXT NOT NULL,
    "status" "PresentationStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "presentations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presentation_themes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "theme_data" JSONB NOT NULL,
    "logo_url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "type" "PresentationThemeType" NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presentation_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_documents" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "favorite_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_libraries" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ImageLibraryType" NOT NULL,
    "prompt" TEXT,
    "provider" TEXT,
    "model_id" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_libraries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "base_documents_user_id_created_at_idx" ON "base_documents"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "presentations_status_idx" ON "presentations"("status");

-- CreateIndex
CREATE INDEX "presentation_themes_user_id_idx" ON "presentation_themes"("user_id");

-- CreateIndex
CREATE INDEX "presentation_themes_type_is_public_idx" ON "presentation_themes"("type", "is_public");

-- CreateIndex
CREATE UNIQUE INDEX "presentation_themes_name_user_id_key" ON "presentation_themes"("name", "user_id");

-- CreateIndex
CREATE INDEX "image_libraries_user_id_type_idx" ON "image_libraries"("user_id", "type");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base_documents" ADD CONSTRAINT "base_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentations" ADD CONSTRAINT "presentations_id_fkey" FOREIGN KEY ("id") REFERENCES "base_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentations" ADD CONSTRAINT "presentations_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "presentation_themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation_themes" ADD CONSTRAINT "presentation_themes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_documents" ADD CONSTRAINT "favorite_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_documents" ADD CONSTRAINT "favorite_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "base_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_libraries" ADD CONSTRAINT "image_libraries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
