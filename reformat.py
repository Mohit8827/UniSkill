import os

def reformat_file(name, count):
    content = ""
    for i in range(count):
        with open(f"tmp_{name}_{i}.txt", "r", encoding="utf-8-sig") as f:
            content += f.read()
    
    # Simple reformatting: add newlines after common tokens
    # but try not to break everything. 
    # Better yet, just fix the known syntax errors.
    
    # Fix for signup page: check for unclosed braces
    open_braces = content.count('{')
    close_braces = content.count('}')
    print(f"{name}: Open {open_braces}, Close {close_braces}")
    
    # For room page specifically
    if name == "room":
        if open_braces > close_braces:
            content += "}" * (open_braces - close_braces)
            print(f"Added {open_braces - close_braces} braces to room")

    # For signup page specifically (original chunks)
    if name == "signup":
        if open_braces > close_braces:
            content += "}" * (open_braces - close_braces)
            print(f"Added {open_braces - close_braces} braces to signup")
            
    return content

signup_content = reformat_file("signup", 5)
room_content = reformat_file("room", 3)

# Write them back
# We'll use a very simple formatter that just adds newlines after { and } 
# and before and after common keywords if they are not in strings.

def simple_format(c):
    res = ""
    in_str = False
    quote = ""
    for i, char in enumerate(c):
        if not in_str:
            if char in ["'", '"', '`']:
                in_str = True
                quote = char
                res += char
            elif char == '{':
                res += "{\n"
            elif char == '}':
                res += "\n}\n"
            elif char == ';':
                res += ";\n"
            else:
                res += char
        else:
            if char == quote and c[i-1] != '\\':
                in_str = False
            res += char
    return res

with open("frontend/src/app/signup/page.tsx", "w", encoding="utf-8") as f:
    f.write(simple_format(signup_content))

with open("frontend/src/app/room/[id]/page.tsx", "w", encoding="utf-8") as f:
    f.write(simple_format(room_content))
