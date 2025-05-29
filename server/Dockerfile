FROM public.ecr.aws/lambda/python:3.11

# Use yum instead of microdnf
RUN yum install -y gcc gcc-c++ python3-devel ninja-build meson pkgconfig && \
    yum clean all

RUN pip install --upgrade pip setuptools wheel cython

WORKDIR ${LAMBDA_TASK_ROOT}

COPY . .

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

CMD ["main.handler"]
