import matplotlib.pyplot as plt
import albumentations as A
from tqdm import tqdm
import pandas as pd
import cv2
import sys
import os

if len(sys.argv) < 4:
    print('Not enough arguments!')
    print('NUMBER_OF_AUGMENTATIONS', 'INPUT_DIRECTORY', 'OUTPUT_DIRECTORY')
    exit()

AUGMENTATIONS = int(sys.argv[1])
INPUT_DIRECTORY = sys.argv[2]
OUTPUT_DIRECTORY = sys.argv[3]

IMAGE_INPUT_DIRECTORY = f'{INPUT_DIRECTORY}/images'
IMAGE_OUTPUT_DIRECTORY = f'{OUTPUT_DIRECTORY}/images'

if not os.path.exists(IMAGE_OUTPUT_DIRECTORY):
    os.makedirs(IMAGE_OUTPUT_DIRECTORY)


bbox_params = A.BboxParams(
    format='pascal_voc',
    min_area=1,
    min_visibility=0.5,
    label_fields=['class_labels']
)

augmentation_arguments = A.Compose([
    A.Flip(always_apply=True),
    A.RandomGamma(gamma_limit=(20, 120), p=0.5),
    A.RandomBrightnessContrast(
        brightness_limit=0.1, contrast_limit=0.1, p=0.55),
    A.RandomRotate90(p=0.25),
    A.RGBShift(p=0.75),
    A.GaussNoise(p=0.25),
    A.JpegCompression(p=0.6),
    A.Blur(p=0.2),
    A.ShiftScaleRotate(p=0.5),
    A.MedianBlur(p=0.2),
    A.CLAHE(p=0.3)
], bbox_params=bbox_params)

images = os.listdir(IMAGE_INPUT_DIRECTORY)
annotations = pd.read_csv(f'{INPUT_DIRECTORY}/annotations.csv', names=[
                          'class', 'x', 'y', 'w', 'h', 'file', 'width', 'height'], header=None)
csv_rows = []
for image in tqdm(images):
    loaded_image = cv2.imread(f'{IMAGE_INPUT_DIRECTORY}/{image}')

    rows = annotations.loc[annotations['file'] == image]

    image_bboxes = []

    for index, row in rows.iterrows():
        if row['w'] == 0 or row['h'] == 0:
            print(row['w'], row['h'])
            continue
        image_bboxes.append(
            [row['x'], row['y'], row['x']+row['w'], row['y']+row['h']])

    for augmentations in tqdm(range(AUGMENTATIONS)):
        augmented = augmentation_arguments(
            image=loaded_image, bboxes=image_bboxes, class_labels=['flower']*len(image_bboxes))
        file_name = f'{image}_augmented{augmentations}.jpg'

        cv2.imwrite(f'{IMAGE_OUTPUT_DIRECTORY}/{file_name}',
                    augmented['image'])

        height, width, channels = cv2.imread(
            f'{IMAGE_OUTPUT_DIRECTORY}/{file_name}').shape

        for bbox in augmented['bboxes']:
            x_min, y_min, x_max, y_max = map(lambda v: int(v), bbox)
            csv_rows.append({
                'class': "Flower",
                'x': x_min,
                'y': y_min,
                'w': x_max,
                'h': y_max,
                'file': file_name,
                'width': width,
                'height': height
            })

pd.DataFrame(csv_rows).to_csv(
    f'{OUTPUT_DIRECTORY}/annotations.csv', header=False, index=None)
