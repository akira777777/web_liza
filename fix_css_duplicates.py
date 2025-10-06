#!/usr/bin/env python3
"""
CSS Duplicate Selector Fixer

Этот скрипт исправляет дублирующиеся селекторы в CSS файле путем объединения
всех их свойств в один селектор.
"""

import re
import sys
from collections import defaultdict

def parse_css_file(filename):
    """Парсит CSS файл и извлекает селекторы с их свойствами."""
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Удаляем комментарии
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Находим все CSS блоки (селектор + свойства)
    pattern = r'([^{}]+)\s*{\s*([^{}]*)\s*}'
    matches = re.findall(pattern, content)
    
    selectors = defaultdict(list)
    all_blocks = []
    
    for selector, properties in matches:
        selector = selector.strip()
        properties = properties.strip()
        
        if properties:  # Игнорируем пустые блоки
            selectors[selector].append(properties)
            all_blocks.append((selector, properties))
    
    return selectors, all_blocks

def merge_properties(property_blocks):
    """Объединяет несколько блоков свойств в один."""
    all_props = {}
    
    for block in property_blocks:
        # Разбиваем свойства на отдельные объявления
        props = re.split(r';\s*', block)
        for prop in props:
            prop = prop.strip()
            if ':' in prop and prop:
                key, value = prop.split(':', 1)
                key = key.strip()
                value = value.strip()
                all_props[key] = value
    
    # Восстанавливаем CSS формат
    result = []
    for key, value in all_props.items():
        result.append(f'  {key}: {value};')
    
    return '\n'.join(result)

def fix_css_duplicates(input_file, output_file=None):
    """Исправляет дублирующиеся селекторы в CSS файле."""
    if output_file is None:
        output_file = input_file
    
    # Читаем оригинальный файл, сохраняя комментарии и структуру
    with open(input_file, 'r', encoding='utf-8') as f:
        original_content = f.read()
    
    selectors, all_blocks = parse_css_file(input_file)
    
    # Находим дублирующиеся селекторы
    duplicates = {sel: props for sel, props in selectors.items() if len(props) > 1}
    
    print(f"Найдено {len(duplicates)} дублирующихся селекторов:")
    for selector in duplicates.keys():
        print(f"  - {selector}")
    
    # Создаем исправленный контент
    processed_selectors = set()
    new_content = []
    
    # Разбиваем оригинальный контент на части для обработки
    lines = original_content.split('\n')
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Проверяем, начинается ли CSS блок
        if '{' in line and not line.startswith('/*') and not line.startswith('@'):
            # Извлекаем селектор
            selector_line = line.split('{')[0].strip()
            
            if selector_line in duplicates and selector_line not in processed_selectors:
                # Это дублирующийся селектор, который мы еще не обработали
                merged_props = merge_properties(duplicates[selector_line])
                new_content.append(f'{selector_line} {{')
                new_content.append(merged_props)
                new_content.append('}')
                new_content.append('')
                processed_selectors.add(selector_line)
                
                # Пропускаем до конца блока
                brace_count = 1
                i += 1
                while i < len(lines) and brace_count > 0:
                    if '{' in lines[i]:
                        brace_count += lines[i].count('{')
                    if '}' in lines[i]:
                        brace_count -= lines[i].count('}')
                    i += 1
                continue
            elif selector_line in processed_selectors:
                # Пропускаем уже обработанный дублирующийся селектор
                brace_count = 1
                i += 1
                while i < len(lines) and brace_count > 0:
                    if '{' in lines[i]:
                        brace_count += lines[i].count('{')
                    if '}' in lines[i]:
                        brace_count -= lines[i].count('}')
                    i += 1
                continue
        
        # Если это не дублирующийся селектор, добавляем как есть
        new_content.append(lines[i])
        i += 1
    
    # Записываем исправленный файл
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_content))
    
    print(f"Исправленный файл сохранен как: {output_file}")
    return len(duplicates)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Использование: python fix_css_duplicates.py <input_file> [output_file]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        duplicates_fixed = fix_css_duplicates(input_file, output_file)
        print(f"Успешно исправлено {duplicates_fixed} дублирующихся селекторов!")
    except Exception as e:
        print(f"Ошибка: {e}")
        sys.exit(1)