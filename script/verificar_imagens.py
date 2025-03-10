from PIL import Image
import imagehash
import os
from collections import defaultdict

def find_similar_images(directory, tolerance=5, resize_dim=(256, 256)):
    image_hashes = defaultdict(list)  # Armazena imagens com hashes semelhantes
    duplicates = []  # Para armazenar as imagens duplicadas

    # Função recursiva para percorrer o diretório e subpastas
    def process_directory(current_dir):
        for root, _, files in os.walk(current_dir):
            for file in files:
                if file.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp')):
                    filepath = os.path.join(root, file)
                    try:
                        image = Image.open(filepath)
                        image = image.resize(resize_dim)  # Normaliza o tamanho da imagem
                        hash = imagehash.phash(image)  # Calcula o hash perceptual da imagem

                        # Verifica se existe uma imagem com hash semelhante (dentro da tolerância)
                        found_similar = False
                        for existing_hash in image_hashes:
                            if hash - existing_hash <= tolerance:  # Comparação com tolerância ajustável
                                image_hashes[existing_hash].append(filepath)
                                # duplicates.append((filepath, image_hashes[existing_hash][0]))
                                duplicates.append((os.path.basename(filepath), os.path.basename(image_hashes[existing_hash][0])))
                                found_similar = True
                                break
                        
                        if not found_similar:
                            image_hashes[hash].append(filepath)

                    except Exception as e:
                        print(f"Erro ao processar {file}: {e}")

    # Inicia o processamento
    process_directory(directory)
    
    # Exibe o relatório
    if duplicates:
        print(f"\nImagens duplicadas ou semelhantes encontradas (Tolerância: {tolerance}):\n")
        for img1, img2 in duplicates:
            print(f"{img1}   --->   {img2}")
    else:
        print("Nenhuma imagem duplicada ou semelhante foi encontrada.")
    
    return duplicates

# Solicita o diretório ao usuário
directory_path = input("Por favor, insira o caminho do diretório a ser escaneado: ")

# Defina o valor de tolerância, se desejar alterar
tolerance_value = 15  # Aumente esse valor para ser mais permissivo na similaridade

# Executa a função
duplicated_images = find_similar_images(directory_path, tolerance=tolerance_value)
