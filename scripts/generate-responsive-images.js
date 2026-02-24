/**
 * Скрипт для генерации responsive версий изображений
 * Создает WebP, AVIF и оптимизированные JPG в разных размерах
 */

import sharp from 'sharp';
import { readdir, mkdir, stat } from 'fs/promises';
import { join, parse, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Размеры для responsive изображений
const SIZES = [320, 640, 1024, 1920];

// Форматы и настройки качества
const FORMATS = {
    jpg: { quality: 85 },
    webp: { quality: 82 },
    avif: { quality: 75 },
};

// Пути
const INPUT_DIR = join(__dirname, '..', 'public', 'assets', 'img', 'content');
const OUTPUT_DIR = join(__dirname, '..', 'public', 'assets', 'img', 'optimized');

/**
 * Обработка одного изображения
 */
async function processImage(inputPath, filename) {
    const { name } = parse(filename);

    console.log(`\nОбработка: ${filename}`);

    // Получаем информацию об оригинальном изображении
    const metadata = await sharp(inputPath).metadata();
    const originalWidth = metadata.width;

    console.log(`  Оригинальный размер: ${originalWidth}px`);

    // Генерируем изображения для каждого размера
    for (const width of SIZES) {
        // Пропускаем размеры больше оригинала
        if (width > originalWidth) {
            console.log(`  ⏭️  Пропуск ${width}w (больше оригинала)`);
            continue;
        }

        // Генерируем для каждого формата
        for (const [format, options] of Object.entries(FORMATS)) {
            const outputFilename = `${name}-${width}w.${format}`;
            const outputPath = join(OUTPUT_DIR, outputFilename);

            try {
                await sharp(inputPath)
                    .resize(width, null, {
                        withoutEnlargement: true,
                        fit: 'inside',
                    })
                    .toFormat(format, options)
                    .toFile(outputPath);

                const fileStats = await stat(outputPath);
                const sizeKB = (fileStats.size / 1024).toFixed(1);

                console.log(`  ✓ ${outputFilename} (${sizeKB}KB)`);
            } catch (error) {
                console.error(`  ✗ Ошибка при создании ${outputFilename}:`, error.message);
            }
        }
    }
}

/**
 * Главная функция
 */
async function main() {
    console.log('🖼️  Генерация responsive изображений\n');
    console.log(`Входная папка: ${INPUT_DIR}`);
    console.log(`Выходная папка: ${OUTPUT_DIR}`);
    console.log(`Размеры: ${SIZES.join(', ')}px`);
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

        // Обрабатываем каждое изображение
        for (const file of imageFiles) {
            const inputPath = join(INPUT_DIR, file);
            await processImage(inputPath, file);
        }

        console.log('\n' + '─'.repeat(60));
        console.log(`\n✅ Генерация завершена!`);
        console.log(`📂 Оптимизированные изображения: ${OUTPUT_DIR}\n`);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

main();
