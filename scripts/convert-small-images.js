/**
 * Скрипт для конвертации маленьких изображений в WebP и AVIF
 * без изменения размера (для photo-*, photographer-* и других маленьких изображений)
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, parse, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Форматы и настройки качества
const FORMATS = {
    webp: { quality: 82 },
    avif: { quality: 75 },
};

// Пути
const INPUT_DIR = join(__dirname, '..', 'public', 'assets', 'img', 'content');
const OUTPUT_DIR = join(__dirname, '..', 'public', 'assets', 'img', 'optimized');

// Максимальный размер для конвертации без resize (px)
const MAX_SIZE_FOR_SIMPLE_CONVERT = 600;

/**
 * Обработка одного изображения
 */
async function convertImage(inputPath, filename) {
    const { name } = parse(filename);

    // Получаем информацию об оригинальном изображении
    const metadata = await sharp(inputPath).metadata();
    const originalWidth = metadata.width;

    // Пропускаем большие изображения (они обрабатываются основным скриптом)
    if (originalWidth > MAX_SIZE_FOR_SIMPLE_CONVERT) {
        return null;
    }

    console.log(`\nКонвертация: ${filename} (${originalWidth}px)`);

    const results = [];

    // Генерируем для каждого формата
    for (const [format, options] of Object.entries(FORMATS)) {
        const outputFilename = `${name}.${format}`;
        const outputPath = join(OUTPUT_DIR, outputFilename);

        try {
            await sharp(inputPath).toFormat(format, options).toFile(outputPath);

            const fileStats = await import('fs/promises').then((fs) => fs.stat(outputPath));
            const sizeKB = (fileStats.size / 1024).toFixed(1);

            console.log(`  ✓ ${outputFilename} (${sizeKB}KB)`);
            results.push(outputFilename);
        } catch (error) {
            console.error(`  ✗ Ошибка при создании ${outputFilename}:`, error.message);
        }
    }

    return results.length > 0 ? name : null;
}

/**
 * Главная функция
 */
async function main() {
    console.log('🖼️  Конвертация маленьких изображений в WebP/AVIF\n');
    console.log(`Входная папка: ${INPUT_DIR}`);
    console.log(`Выходная папка: ${OUTPUT_DIR}`);
    console.log(`Макс. размер для конвертации: ${MAX_SIZE_FOR_SIMPLE_CONVERT}px`);
    console.log(`Форматы: ${Object.keys(FORMATS).join(', ')}\n`);

    // Создаем выходную папку если не существует
    if (!existsSync(OUTPUT_DIR)) {
        await mkdir(OUTPUT_DIR, { recursive: true });
        console.log(`✓ Создана папка: ${OUTPUT_DIR}\n`);
    }

    try {
        // Читаем все файлы из входной папки
        const files = await readdir(INPUT_DIR);

        // Фильтруем только изображения JPG/PNG
        const imageFiles = files.filter((file) => /\.(jpe?g|png)$/i.test(file));

        if (imageFiles.length === 0) {
            console.log('❌ Не найдено изображений для обработки');
            return;
        }

        console.log(`📁 Найдено изображений: ${imageFiles.length}\n`);
        console.log('─'.repeat(60));

        let processedCount = 0;

        // Обрабатываем каждое изображение
        for (const file of imageFiles) {
            const inputPath = join(INPUT_DIR, file);
            const result = await convertImage(inputPath, file);
            if (result) {
                processedCount++;
            }
        }

        console.log('\n' + '─'.repeat(60));
        console.log(`\n✅ Конвертация завершена!`);
        console.log(`📊 Обработано изображений: ${processedCount}`);
        console.log(`📂 Результат: ${OUTPUT_DIR}\n`);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

main();
