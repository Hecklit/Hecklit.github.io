from PIL import Image
import glob, os

def process_img(path):
    name = path[6:-4]
    im = Image.open(path)
    pix = im.load()

    output = '\'{}\': [\n'.format(name)
    for y in range(1, im.size[0]-1):
        output += '[ '
        for x in range(1, im.size[1]-1):
            if pix[y,x][0] == 255:
                output += 'false, '
            else:
                output += 'true, '
        output += '],\n'
    output += '],\n\n'
    return output

output = 'const figures = {'
for file in glob.glob("./img/*.png"):
    output += process_img(file)
output += '};'
with open('./figures.js', 'w') as fig:
    fig.write(output)
